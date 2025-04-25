import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface Config {
  profiles: {
    default: {
      network?: string;
      account?: string;
      rest_url?: string;
    };
  };
}

export function getConfigPath(): string {
  return path.join(__dirname, '../.aptos/config.yaml');
}

export function getMoveTomlPath(): string {
  return path.join(__dirname, '../Move.toml');
}
