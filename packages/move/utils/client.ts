import { execSync, execFile } from 'child_process';
import * as readline from 'readline';
import * as fs from 'fs';
import * as os from 'os';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Default configurations
type NetworkConfig = {
    alias: string;
    rpc: string;
};

type DefaultConfigs = {
    [key: string]: NetworkConfig;
};

const DEFAULT_CONFIGS: DefaultConfigs = {
    testnet: {
        alias: 'testnet',
        rpc: 'https://api.testnet.iota.cafe'
    },
    devnet: {
        alias: 'devnet',
        rpc: 'https://api.devnet.iota.cafe'
    }
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nProcess terminated by user');
    process.exit(0);
});

// Function to check if client config exists
function clientConfigExists(): boolean {
    const configPath = `${os.homedir()}/.iota/iota_config/client.yaml`;
    return fs.existsSync(configPath);
}

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
    console.log('\nOr type "n" to set up a new environment');
    console.log(); // Empty line for better readability
}

// Function to handle client switching
async function handleClientSwitch() {
    const { envs, activeEnv } = getEnvsInfo();
    displayEnvs(envs, activeEnv);

    return new Promise((resolve) => {
        rl.question('Enter your choice: ', async (answer) => {
            if (answer.toLowerCase() === 'n') {
                await setupNewClient(envs);
                resolve(null);
                return;
            }

            const index = parseInt(answer) - 1;

            if (isNaN(index) || index < 0 || index >= envs.length) {
                console.error('Invalid selection. Please enter a valid number or "n".');
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

            resolve(null);
        });
    });
}

// Function to display setup options
function displaySetupOptions(availableDefaults: string[]) {
    console.log('\nAvailable setup options:');
    let optionIndex = 1;

    if (availableDefaults.includes('testnet')) {
        console.log(`${optionIndex}. IOTA Testnet`);
        optionIndex++;
    }

    if (availableDefaults.includes('devnet')) {
        console.log(`${optionIndex}. IOTA Devnet`);
        optionIndex++;
    }

    console.log(`${optionIndex}. Custom configuration`);
    console.log(); // Empty line for better readability
}

// Function to ask user for custom setup details
async function getCustomSetupDetails(): Promise<{ alias: string, rpc: string }> {
    const alias = await new Promise<string>((resolve) => {
        rl.question('Enter environment alias: ', (answer) => {
            resolve(answer.trim());
        });
    });

    const rpc = await new Promise<string>((resolve) => {
        rl.question('Enter RPC URL: ', (answer) => {
            resolve(answer.trim());
        });
    });

    return { alias, rpc };
}

// Function to run command with interactive input
function runInteractiveCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = execFile('iota', command.split(' '), (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });

        // Handle stdin
        process.stdin.setRawMode(true);
        process.stdin.on('data', (data) => {
            const input = data.toString();

            // Check for Ctrl+C (ASCII code 3)
            if (data[0] === 3) {
                console.log('\nExiting...');
                if (child.pid) {
                    process.kill(child.pid);
                }
                process.exit(0);
            }

            // Send input to child process without echoing
            if (child.stdin) {
                if (input === '\r' || input === '\n') {
                    process.stdout.write('\n'); // Only echo newline
                    child.stdin.write('\n');
                } else {
                    child.stdin.write(input); // Don't echo other characters
                }
            }
        });

        // Handle stdout
        if (child.stdout) {
            child.stdout.on('data', (data) => {
                process.stdout.write(data);
            });
        }

        // Handle stderr
        if (child.stderr) {
            child.stderr.on('data', (data) => {
                process.stderr.write(data);
            });
        }

        child.on('exit', (code) => {
            process.stdin.setRawMode(false);
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

// Function to handle new client setup
async function setupNewClient(existingEnvs: string[] = []): Promise<void> {
    if (!existingEnvs.length) {
        console.log('No client configuration found.');
    }

    // Determine which default configurations are available
    const availableDefaults: string[] = [];
    if (!existingEnvs.includes('testnet')) {
        availableDefaults.push('testnet');
    }
    if (!existingEnvs.includes('devnet')) {
        availableDefaults.push('devnet');
    }

    displaySetupOptions(availableDefaults);

    const choice = await new Promise<number>((resolve) => {
        rl.question('Enter your choice (number): ', (answer) => {
            const num = parseInt(answer);
            if (isNaN(num) || num < 1 || num > availableDefaults.length + 1) {
                console.error('Invalid selection. Please enter a valid number.');
                rl.close();
                process.exit(1);
            }
            resolve(num);
        });
    });

    // Handle default configurations
    if (choice <= availableDefaults.length) {
        const selectedDefault = availableDefaults[choice - 1];
        const config = DEFAULT_CONFIGS[selectedDefault];

        console.log(`\nSetting up new client with ${selectedDefault} defaults...
Alias: ${config.alias}
RPC: ${config.rpc}\n`);

        await runInteractiveCommand(`client new-env --alias ${config.alias} --rpc ${config.rpc}`);
        console.log(`\nSuccessfully set up new client with ${selectedDefault} defaults`);
        return;
    }

    // Handle custom configuration
    console.log('\nPlease provide custom configuration:');
    let config = await getCustomSetupDetails();

    // Check if alias already exists
    while (existingEnvs.includes(config.alias)) {
        console.log(`\nError: Environment alias '${config.alias}' already exists. Please choose a different alias.`);
        config = await getCustomSetupDetails();
    }

    await runInteractiveCommand(`client new-env --alias ${config.alias} --rpc ${config.rpc}`);
    console.log(`\nSuccessfully set up new client with custom configuration`);
}

// Main function
async function main() {
    try {
        if (!clientConfigExists()) {
            await setupNewClient();
        } else {
            await handleClientSwitch();
        }
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();