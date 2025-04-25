import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface DeploymentOutput {
  createdObjects: string[];
  timestamp: string;
}

async function main(): Promise<void> {
  // Build deploy command
  const deployCommand = 'iota client publish';

  try {
    // Execute deploy command and capture output
    console.log(`Executing: ${deployCommand}`);
    const output = execSync(deployCommand, { encoding: 'utf-8' });

    // Parse the output to extract created object IDs
    // Look for lines containing "ID: 0x" and extract the hex address
    const createdObjects = output
      .split('\n')
      .filter(line => line.includes('ID: 0x'))
      .map(line => {
        const match = line.match(/ID: (0x[a-fA-F0-9]+)/);
        return match ? match[1] : null;
      })
      .filter((id): id is string => id !== null);

    // Remove duplicates and ensure type safety
    const uniqueObjects: string[] = Array.from(new Set(createdObjects));

    // Create deployment data
    const deploymentData: DeploymentOutput = {
      createdObjects: uniqueObjects,
      timestamp: new Date().toISOString()
    };

    // Ensure deployments directory exists
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Store deployment data
    const deploymentPath = path.join(deploymentsDir, 'latest-deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));

    console.log('Deployment successful. Created unique objects:', uniqueObjects);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Deployment failed:', error.message);
    } else {
      console.error('Deployment failed with unknown error');
    }
    process.exit(1);
  }
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error('Unhandled error:', error.message);
  } else {
    console.error('Unhandled error of unknown type');
  }
  process.exit(1);
});