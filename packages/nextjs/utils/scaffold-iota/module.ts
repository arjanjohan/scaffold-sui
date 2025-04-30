import deployedModulesData from "~~/modules/deployedModules";

// Helper type to create a tuple of any type with specific length
type TupleOfLength<L extends number, T = any> = [T, ...T[]] & { length: L };

// Base types for Sui Move
type MoveBaseTypes = {
  "u8": number;
  "u16": number;
  "u32": number;
  "u64": bigint;
  "u128": bigint;
  "u256": bigint;
  "bool": boolean;
  "address": string;
  "vector<u8>": Uint8Array;
  "vector<T>": any[];
  "&mut TxContext": never;
  "&TxContext": never;
};

// Helper type to extract function parameters from Move parameter strings
type ExtractMoveParam<T extends string> = T extends keyof MoveBaseTypes
  ? MoveBaseTypes[T]
  : T extends `&mut ${infer Inner}`
    ? ExtractMoveParam<Inner>
    : T extends `&${infer Inner}`
      ? ExtractMoveParam<Inner>
      : T extends `vector<${infer Inner}>`
        ? ExtractMoveParam<Inner>[]
        : T extends `option::Option<${infer Inner}>`
          ? ExtractMoveParam<Inner> | null
          : unknown;

type FilterNever<T extends readonly any[]> = T extends readonly [infer First, ...infer Rest]
  ? ExtractMoveParam<First & string> extends never
    ? FilterNever<Rest>
    : [ExtractMoveParam<First & string>, ...FilterNever<Rest>]
  : [];

export type ExtractMoveParams<T extends readonly string[]> = FilterNever<T>;

// Get all modules for a specific network
type NetworkModules = (typeof deployedModulesData)[keyof typeof deployedModulesData];

// Get all functions for a module
type ModuleFunctions<TModule extends GenericModule> = {
  [K in TModule["functions"][number]["name"]]: Extract<
    TModule["functions"][number],
    { name: K }
  > extends infer F extends FunctionSignature
    ? {
        args: ExtractMoveParams<F["parameters"][number]["type"][]>;
        tyArgs: [];
      }
    : never;
};

// Get all functions for a specific module
export type ModuleEntryFunctions<TModuleName extends keyof NetworkModules> = ModuleFunctions<
  Extract<NetworkModules[TModuleName], GenericModule>
>;

// Get function names that are entry functions
export type ModuleEntryFunctionNames<TModuleName extends keyof NetworkModules> = keyof ModuleEntryFunctions<TModuleName>;

export type GenericModule = {
  address: string;
  functions: readonly FunctionSignature[];
  content: string;
};

export type FunctionSignature = {
  name: string;
  parameters: readonly FunctionParameter[];
};

export type FunctionParameter = {
  name: string;
  type: string;
  isOption: boolean;
};

export type GenericModulesDeclaration = {
  [network: string]: {
    [moduleName: string]: GenericModule;
  };
};

export const modules = deployedModulesData as GenericModulesDeclaration;

type Network = keyof typeof deployedModulesData;
type Modules = (typeof deployedModulesData)["testnet"]; // TODO: do we need hardcoded network here?

export type ModuleName = keyof Modules;
export type Module<TModuleName extends ModuleName> = Modules[TModuleName];

export enum ModuleCodeStatus {
  "LOADING",
  "DEPLOYED",
  "NOT_FOUND",
}
