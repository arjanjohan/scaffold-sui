import { execSync } from 'child_process';
import * as readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get available environments and active env
function getEnvsInfo(): { envs: string[], activeEnv: string } {
    try {
        const output = execSync('iota client envs --json', { encoding: 'utf-8' });
        const [envs, activeEnv] = JSON.parse(output);
        return {
            envs: envs.map((env: any) => env.alias),
            activeEnv
        };
    } catch (error) {
        console.error('Failed to get environments:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

// Function to display environments
function displayEnvs(envs: string[], activeEnv: string) {
    console.log('\nAvailable environments:');
    envs.forEach((env, index) => {
        const active = env === activeEnv ? ' (active)' : '';
        console.log(`${index + 1}. ${env}${active}`);
    });
    console.log(); // Empty line for better readability
}

// Main function
async function main() {
    const { envs, activeEnv } = getEnvsInfo();
    displayEnvs(envs, activeEnv);

    rl.question('Enter the number of the environment to switch to: ', (answer) => {
        const index = parseInt(answer) - 1;

        if (isNaN(index) || index < 0 || index >= envs.length) {
            console.error('Invalid selection. Please enter a valid number.');
            rl.close();
            process.exit(1);
        }

        const selectedEnv = envs[index];

        try {
            execSync(`iota client switch --env ${selectedEnv}`, { stdio: 'inherit' });
            console.log(`\nSuccessfully switched to environment: ${selectedEnv}`);
        } catch (error) {
            console.error('Failed to switch environment:', error instanceof Error ? error.message : 'Unknown error');
        }

        rl.close();
    });
}

main();