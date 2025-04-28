import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const deploymentsDir = path.join(__dirname, '../deployments');

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


interface NetworkModules {
  [moduleName: string]: string;  // moduleName -> address mapping
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

}

main().catch(console.error);