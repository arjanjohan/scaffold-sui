import * as fs from 'fs';
import * as path from 'path';
import { getFullnodeUrl, IotaClient } from '@iota/iota-sdk/client';

import axios from 'axios';
import { getMoveTomlPath } from './utils';
import { execSync } from 'child_process';
import { MoveModuleBytecode } from '@aptos-labs/ts-sdk';

const deploymentsDir = path.join(__dirname, '../deployments');

// Paths to the relevant files
const deployedModulesPath = path.join(__dirname, '../../../packages/nextjs/modules/deployedModules.ts');
const externalModulesPath = path.join(__dirname, '../../../packages/nextjs/modules/externalModules.ts');
const otherModulePath = path.join(__dirname, '../../../packages/nextjs/modules/latestChainId.ts');

interface Addresses {
  [key: string]: string;
}

interface ModuleData {
  [key: string]: {
    bytecode: string;
    abi: any;
  };
}

interface ChainModules {
  [chainId: string]: ModuleData;
}

interface DeploymentOutput {
  createdObjects: string[];
  timestamp: string;
}

interface IotaObjectResponse {
  type: string;
  id: string;
  content?: {
    dataType: string;
    disassembled: {
      [moduleName: string]: string;
    };
  };
  // Add other fields as needed
}

interface IotaEnvConfig {
  alias: string;
  rpc: string;
  graphql: string | null;
  ws: string | null;
  basic_auth: string | null;
  faucet: string | null;
}

interface NetworkModules {
  [moduleName: string]: string;  // moduleName -> address mapping
}

function getCurrentRpcUrl(): string {
  try {
    const envOutput = execSync('iota client envs --json', { encoding: 'utf-8' });
    const [envConfigs, currentAlias] = JSON.parse(envOutput);

    const currentConfig = (envConfigs as IotaEnvConfig[]).find(
      config => config.alias === currentAlias
    );

    if (!currentConfig) {
      throw new Error(`Could not find configuration for current alias: ${currentAlias}`);
    }

    return currentConfig.rpc;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get current RPC URL: ${error.message}`);
    }
    throw new Error('Failed to get current RPC URL with unknown error');
  }
}

function getCurrentNetwork(): string {
  const envOutput = execSync('iota client envs --json', { encoding: 'utf-8' });
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

// Function to fetch account modules
async function getAccountModules(
  requestParameters: { address: string; ledgerVersion?: string },
) {
  try {
    const rpcUrl = getCurrentRpcUrl();
    console.log(`Using RPC URL: ${rpcUrl}`);

    // create a client connected to the current environment
    const client = new IotaClient({ url: rpcUrl });
    const object = await client.getObject({ id: requestParameters.address });
    return object;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to get account modules: ${error.message}`);
    } else {
      console.error('Failed to get account modules with unknown error');
    }
    throw error;
  }
}

// Function to get existing module data
function getExistingModulesData(filePath: string): ModuleData {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const match = fileContent.match(/deployedModules\s*=\s*({[\s\S]*});/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
  }
  return {};
}

// Function to write chain-specific modules
function writeChainModules(chainId: number, modules: MoveModuleBytecode[], isDeployed: boolean): void {
  const chainDir = path.join(deploymentsDir, chainId.toString());
  if (!fs.existsSync(chainDir)) {
    fs.mkdirSync(chainDir, { recursive: true });
  }

  const fileName = isDeployed ? 'deployedModules.json' : 'externalModules.json';
  const filePath = path.join(chainDir, fileName);

  const moduleData = modules.reduce((acc: ModuleData, module) => {
    if (module.abi?.name) {
      acc[module.abi.name] = {
        bytecode: module.bytecode,
        abi: module.abi
      };
    }
    return acc;
  }, {});

  fs.writeFileSync(filePath, JSON.stringify(moduleData, null, 2), 'utf-8');
}

// Function to write modules
function writeModules(filePath: string, variableName: string): void {
  const allChainDirs = fs.readdirSync(deploymentsDir);
  const allModules: ChainModules = {};

  allChainDirs.forEach(chainDir => {
    const chainModulesPath = path.join(deploymentsDir, chainDir, `${variableName}.json`);
    if (fs.existsSync(chainModulesPath)) {
      const chainModules = JSON.parse(fs.readFileSync(chainModulesPath, 'utf-8'));
      allModules[chainDir] = chainModules;
    }
  });

  // Generate file content
  const fileContent = `
  /**
   * This file is autogenerated.
   * You should not edit it manually or your changes might be overwritten.
   */
  import { GenericModulesDeclaration } from "~~/utils/scaffold-move/module";

  const ${variableName} = {
    ${Object.entries(allModules).reduce((content, [chainId, chainConfig]) => {
      return `${content}${parseInt(chainId).toFixed(0)}:${JSON.stringify(chainConfig, null, 2)},`;
    }, '')}
  } as const;

  export default ${variableName} satisfies GenericModulesDeclaration;
  `;

  fs.writeFileSync(filePath, fileContent.trim(), 'utf-8');
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
        const result = execSync(`iota client object --json ${id}`).toString();
        const objectData = JSON.parse(result) as IotaObjectResponse;
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

  const accountAddress = execSync('iota client active-address').toString().trim().replace(/^0x/, '');
  const deployedContractIds = await getDeployedContractIds();

  console.log('Account address:', accountAddress);
  console.log('Deployed package IDs:', deployedContractIds);

  for (const contractId of deployedContractIds) {
    try {
      const result = execSync(`iota client object --json ${contractId}`).toString();
      const objectData = JSON.parse(result) as IotaObjectResponse;

      if (objectData.type === "package" && objectData.content?.disassembled) {
        // Extract module names from disassembled content
        for (const [moduleName, _] of Object.entries(objectData.content.disassembled)) {
          storeModuleAddress(network, moduleName, contractId);
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

  // // Fetch and save modules for deployed contracts
  // const deployedModules: MoveModuleBytecode[] = [];
  // for (const contractId of deployedContractIds) {
  //   try {
  //     const modules = await getAccountModules({ address: contractId }, network, network === Network.CUSTOM ? nodeUrl : undefined);
  //     deployedModules.push(...modules);
  //     console.log(`Loaded modules for contract ${contractId}`);
  //   } catch (error) {
  //     console.warn(`Failed to load modules for contract ${contractId}:`, error);
  //   }
  // }

  // // If no deployed contracts found or failed to load, fallback to account address
  // if (deployedModules.length === 0) {
  //   console.log(`No deployed contracts found or failed to load, falling back to account address ${accountAddress}`);
  //   const modules = await getAccountModules({ address: accountAddress }, network, network === Network.CUSTOM ? nodeUrl : undefined);
  //   deployedModules.push(...modules);
  // }

  // writeChainModules(chainId, deployedModules, true);
  // writeModules(deployedModulesPath, "deployedModules");
  // console.log(`Data for deployed modules saved successfully.`);

  // // Fetch and save account modules for each address from Move.toml, excluding the one from config.yaml
  // console.log('Data for external modules:', loadExternalModules);
  // if (loadExternalModules && addresses) {
  //   console.log('Loading external modules...');
  //   const externalModules: MoveModuleBytecode[] = [];
  //   for (const [name, address] of Object.entries(addresses)) {
  //     if (address.toLowerCase() !== accountAddress.toLowerCase()) {
  //       const modules = await getAccountModules({ address }, network, network === Network.CUSTOM ? nodeUrl : undefined);
  //       externalModules.push(...modules);
  //       console.log(`Data for address ${address} saved successfully.`);
  //     }
  //   }
  //   writeChainModules(chainId, externalModules, false);
  //   writeModules(externalModulesPath, "externalModules");
  // }

  // const chainIdContent = `const latestChainId = ${chainId};\nexport default latestChainId;\n`;
  // fs.writeFileSync(otherModulePath, chainIdContent, 'utf-8');
  // console.log(`Chain ID ${chainId} written to ${otherModulePath}`);
}

main().catch(console.error);