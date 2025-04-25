import { execSync } from 'child_process';

// Get the environment name from command line arguments
const envName: string | undefined = process.argv[2];

if (!envName) {
    console.error('Please provide an environment name. Usage: yarn switch-client <env-name>');
    process.exit(1);
}

try {
    execSync(`iota client switch --env ${envName}`, { stdio: 'inherit' });
    console.log(`Successfully switched to environment: ${envName}`);
} catch (error) {
    console.error('Failed to switch environment:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
}