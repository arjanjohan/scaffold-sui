import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const deploymentsDir = path.join(__dirname, '../deployments');
const frontendModulesDir = path.join(__dirname, '../../nextjs/modules');

interface DeploymentOutput {
  createdObjects: string[];
  timestamp: string;
}

interface SuiObjectResponse {
  type: string;
  id: string;
  content?: {
    dataType: string;
    disassembled: {
      [moduleName: string]: string;
    };
  };
}

interface NetworkModules {
  [moduleName: string]: string;  // moduleName -> address mapping
}

interface FunctionParameter {
  name: string;
  type: string;
  isOption: boolean;
}

interface FunctionSignature {
  name: string;
  parameters: FunctionParameter[];
  returnType?: string;
}

interface ModuleInfo {
  address: string;
  functions: FunctionSignature[];
  content: string;
}

interface DeployedModules {
  [networkId: string]: {
    [moduleName: string]: ModuleInfo;
  };
}

function getCurrentNetwork(): string {
  const envOutput = execSync('sui client envs --json', { encoding: 'utf-8' });
  const [envConfigs, currentAlias] = JSON.parse(envOutput);

  // Only accept devnet or testnet
  if (currentAlias === 'devnet' || currentAlias === 'testnet') {
    return currentAlias;
  }
  throw new Error(`Unsupported network alias: ${currentAlias}. Only devnet and testnet are supported.`);
}

function storeModuleAddress(network: string, moduleName: string, address: string) {
  const networkDir = path.join(deploymentsDir, network);
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir, { recursive: true });
  }

  const modulesFile = path.join(networkDir, 'modules.json');
  let modules: NetworkModules = {};

  // Load existing modules if file exists
  if (fs.existsSync(modulesFile)) {
    modules = JSON.parse(fs.readFileSync(modulesFile, 'utf-8'));
  }

  // Add or update module address
  modules[moduleName] = address;

  // Write back to file
  fs.writeFileSync(modulesFile, JSON.stringify(modules, null, 2), 'utf-8');
  console.log(`Stored module ${moduleName} with address ${address} in network ${network}`);
}

function extractFunctionSignatures(moduleContent: string): FunctionSignature[] {
  const functions: FunctionSignature[] = [];
  const functionRegex = /entry public (\w+)\((.*?)\)/g;
  let match;

  while ((match = functionRegex.exec(moduleContent)) !== null) {
    const functionName = match[1];
    const paramsStr = match[2];

    const parameters: FunctionParameter[] = [];
    if (paramsStr.trim()) {
      const paramRegex = /Arg(\d+):\s*([^,)]+)/g;
      let paramMatch;

      while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
        const paramType = paramMatch[2].trim();
        parameters.push({
          name: `arg${paramMatch[1]}`,
          type: paramType,
          isOption: paramType.includes('option::Option<')
        });
      }
    }

    functions.push({
      name: functionName,
      parameters
    });
  }

  return functions;
}

function generateTypeScriptTypes(moduleName: string, functions: FunctionSignature[]): string {
  let types = `// Generated types for ${moduleName}\n\n`;

  // Generate function parameter types
  for (const func of functions) {
    const paramTypes = func.parameters.map(param => {
      let tsType = param.type
        .replace('&mut ', '')
        .replace('&', '')
        .replace('option::Option<', '')
        .replace('>', '')
        .replace('u8', 'number')
        .replace('u64', 'bigint')
        .replace('u128', 'bigint')
        .replace('bool', 'boolean')
        .replace('address', 'string')
        .replace('vector<u8>', 'Uint8Array')
        .replace('vector<T>', 'any[]');

      if (param.isOption) {
        tsType = `${tsType} | null`;
      }

      return `${param.name}: ${tsType}`;
    }).join(', ');

    types += `export interface ${func.name}Params {\n  ${paramTypes}\n}\n\n`;
  }

  return types;
}

function storeModuleContent(network: string, moduleName: string, address: string, content: string) {
  const networkDir = path.join(frontendModulesDir, network);
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir, { recursive: true });
  }

  const functions = extractFunctionSignatures(content);
  const types = generateTypeScriptTypes(moduleName, functions);

  // Store module content
  const moduleContent: ModuleInfo = {
    address,
    functions,
    content
  };

  // Write module content
  fs.writeFileSync(
    path.join(networkDir, `${moduleName}.json`),
    JSON.stringify(moduleContent, null, 2),
    'utf-8'
  );

  // Write TypeScript types
  fs.writeFileSync(
    path.join(networkDir, `${moduleName}.d.ts`),
    types,
    'utf-8'
  );

  console.log(`Stored module ${moduleName} content and types in network ${network}`);
}

function readExistingDeployedModules(): DeployedModules {
  const filePath = path.join(frontendModulesDir, 'deployedModules.ts');
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Extract the object content between the curly braces
    const match = content.match(/const deployedModules = ({[\s\S]*?}) as const;/);
    if (!match) {
      console.warn('Could not parse existing deployedModules.ts file');
      return {};
    }

    // Convert the string to a proper object
    // Note: This is a simple approach - in production you might want to use a proper parser
    const modulesStr = match[1].replace(/\s+/g, ' ').trim();
    return eval(`(${modulesStr})`) as DeployedModules;
  } catch (error) {
    console.warn('Failed to read existing deployedModules.ts:', error);
    return {};
  }
}

function generateDeployedModulesFile(existingModules: DeployedModules, currentNetwork: string, newModules: { [moduleName: string]: ModuleInfo }): string {
  let content = '// This file is autogenerated - do not edit manually, your changes might be overwritten\n';
  content += 'import { GenericModulesDeclaration } from "~~/utils/scaffold-sui/module";\n';
  content += 'const deployedModules = {\n';

  // Start with existing modules
  const allModules = { ...existingModules };

  // Update or add current network's modules
  allModules[currentNetwork] = {
    ...(allModules[currentNetwork] || {}),
    ...newModules
  };

  // Generate content for each network
  for (const [network, modules] of Object.entries(allModules)) {
    content += `  ${network}: {\n`;

    // Add each module in the network
    for (const [moduleName, moduleInfo] of Object.entries(modules)) {
      content += `    "${moduleName}": {\n`;
      content += `      address: "${moduleInfo.address}",\n`;
      content += `      functions: ${JSON.stringify(moduleInfo.functions, null, 4).split('\n').map(line => '      ' + line).join('\n')},\n`;
      content += `      content: \`${moduleInfo.content}\`\n`;
      content += '    },\n';
    }

    content += '  },\n';
  }

  content += '} as const;\n\n';
  content += 'export default deployedModules satisfies GenericModulesDeclaration;\n';

  return content;
}

// Function to get deployed contract IDs
async function getDeployedContractIds(): Promise<string[]> {
  const deploymentPath = path.join(deploymentsDir, 'latest-deployment.json');
  if (fs.existsSync(deploymentPath)) {
    const deploymentData: DeploymentOutput = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));
    // Remove duplicates and ensure type safety
    const uniqueIds: string[] = Array.from(new Set(deploymentData.createdObjects));

    // Filter for packages
    const packageIds: string[] = [];
    for (const id of uniqueIds) {
      try {
        const result = execSync(`sui client object --json ${id}`).toString();
        const objectData = JSON.parse(result) as SuiObjectResponse;
        if (objectData.type === "package") {
          packageIds.push(id);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`Failed to check object ${id}:`, error.message);
        } else {
          console.warn(`Failed to check object ${id} with unknown error`);
        }
      }
    }
    return packageIds;
  }
  return [];
}

// Main function to perform the tasks
async function main(): Promise<void> {
  const network = getCurrentNetwork();
  console.log('Current network:', network);

  const accountAddress = execSync('sui client active-address').toString().trim().replace(/^0x/, '');
  const deployedContractIds = await getDeployedContractIds();

  console.log('Account address:', accountAddress);
  console.log('Deployed package IDs:', deployedContractIds);

  // Read existing modules
  const existingModules = readExistingDeployedModules();
  console.log('Existing modules:', Object.keys(existingModules));

  const newModules: { [moduleName: string]: ModuleInfo } = {};

  for (const contractId of deployedContractIds) {
    try {
      const result = execSync(`sui client object --json ${contractId}`).toString();
      const objectData = JSON.parse(result) as SuiObjectResponse;

      if (objectData.type === "package" && objectData.content?.disassembled) {
        for (const [moduleName, content] of Object.entries(objectData.content.disassembled)) {
          const functions = extractFunctionSignatures(content);
          newModules[moduleName] = {
            address: contractId,
            functions,
            content
          };
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Failed to process contract ${contractId}:`, error.message);
      } else {
        console.warn(`Failed to process contract ${contractId} with unknown error`);
      }
    }
  }

  // Generate and write the deployedModules.ts file
  const deployedModulesContent = generateDeployedModulesFile(existingModules, network, newModules);
  fs.writeFileSync(
    path.join(frontendModulesDir, 'deployedModules.ts'),
    deployedModulesContent,
    'utf-8'
  );

  console.log('Updated deployedModules.ts file');
  console.log('New modules added:', Object.keys(newModules));
}

main().catch(console.error);