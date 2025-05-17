import deployedModulesData from "~~/modules/deployedModules";

// Base types for Sui Move
type MoveBaseTypes = {
  u8: number;
  u16: number;
  u32: number;
  u64: bigint;
  u128: bigint;
  u256: bigint;
  bool: boolean;
  address: string;
  "vector<u8>": Uint8Array;
  "vector<T>": any[];
  "&mut TxContext": never;
  "&TxContext": never;
};

// // Debug type to inspect values
// type Debug<T> = {
//   [K in keyof T]: T[K];
// };

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
          : string;

export type ExtractMoveParams<T extends readonly string[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends string
    ? [ExtractMoveParam<First>, ...ExtractMoveParams<Rest & readonly string[]>]
    : never
  : [];

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

// type Network = keyof typeof deployedModulesData;
type Modules = (typeof deployedModulesData)["testnet"]; // TODO: do we need hardcoded network here?

export type ModuleName = keyof Modules;
export type Module<TModuleName extends ModuleName> = Modules[TModuleName];

// // Get all modules for a specific network
// type NetworkModules = (typeof deployedModulesData)[keyof typeof deployedModulesData];

// Get all functions for a module
type ModuleFunctions<TModule extends GenericModule> = {
  [K in TModule["functions"][number]["name"]]: Extract<
    TModule["functions"][number],
    { name: K }
  > extends FunctionSignature
    ? {
        args: any[];
        tyArgs: any[];
      }
    : never;
};

// Get all functions for a specific module
export type ModuleEntryFunctions<TModuleName extends ModuleName> = ModuleFunctions<
  Extract<Modules[TModuleName], GenericModule>
>;

// // Debug a specific function's parameters
// export type DebugFunctionParams<TModuleName extends ModuleName, TFunctionName extends ModuleEntryFunctionNames<TModuleName>> =
//   Debug<{
//     step4: ExtractMoveParams<["&mut Counter"]>;
//     step5: ["&mut Counter"] extends [infer T] ? [ExtractMoveParam<T & string>] : never;
//     step6: {
//       tupleType: ["&mut Counter"];
//       firstElement: ["&mut Counter"][0];
//       isTuple: ["&mut Counter"] extends [any] ? true : false;
//       inferredType: ["&mut Counter"] extends [infer T] ? T : never;
//       extractedType: ["&mut Counter"] extends [infer T] ? ExtractMoveParam<T & string> : never;
//       test1: ["&mut Counter"] extends [string] ? true : false;
//       test2: ["&mut Counter"] extends readonly [string] ? true : false;
//       test3: ["&mut Counter"] extends [infer T extends string] ? T : never;
//       test4: ExtractMoveParam<"&mut Counter">;
//       test5: ["&mut Counter"] extends [string] ? [string] : never;
//       test6: ["&mut Counter"] extends readonly [string] ? [string] : never;
//     };
//   }>;

// Get function names that are entry functions
export type ModuleEntryFunctionNames<TModuleName extends ModuleName> = keyof ModuleEntryFunctions<TModuleName>;

export enum ModuleCodeStatus {
  "LOADING",
  "DEPLOYED",
  "NOT_FOUND",
}
