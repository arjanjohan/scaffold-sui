import { useIotaClientContext } from "@mysten/dapp-kit";
import modules from "~~/modules/deployedModules";
import { ModuleName } from "~~/utils/scaffold-iota/module";

export function useModuleAddress<TModuleName extends ModuleName>(
  moduleName: TModuleName,
): {
  moduleAddress: string | undefined;
} {
  const ctx = useIotaClientContext();
  const networkModules = modules[ctx.network as keyof typeof modules];
  const moduleAddress = networkModules && (networkModules as any)[moduleName]?.address;

  return {
    moduleAddress,
  };
}
