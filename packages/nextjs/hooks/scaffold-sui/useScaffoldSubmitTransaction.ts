import { useEffect, useState } from "react";
import { useNormalizedMoveModule } from "./useNormalizedMoveModule";
import { type TransactionResponse } from "./useSubmitTransaction";
import { useTargetNetwork } from "./useTargetNetwork";
import { useCurrentAccount, useIotaClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction, getPureBcsSchema, normalizedTypeToMoveTypeSignature } from "@mysten/sui/transactions";
import modules from "~~/modules/deployedModules";
import { ModuleEntryFunctionNames, ModuleEntryFunctions, ModuleName } from "~~/utils/scaffold-sui/module";

const useScaffoldSubmitTransaction = <TModuleName extends ModuleName>(moduleName: TModuleName) => {
  const [transactionResponse, setTransactionResponse] = useState<TransactionResponse | null>(null);
  const [transactionInProcess, setTransactionInProcess] = useState<boolean>(false);

  const currentAccount = useCurrentAccount();
  const iotaClient = useIotaClient();
  const { targetNetwork } = useTargetNetwork();

  // Get module address from deployed modules if not provided
  const networkModules = modules[targetNetwork.id as keyof typeof modules];
  const moduleAddress = networkModules && (networkModules as any)[moduleName]?.address;
  const { data: normalizedModule } = useNormalizedMoveModule(moduleAddress, moduleName);

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await iotaClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
          showEvents: true,
          showInput: true,
        },
      }),
  });

  useEffect(() => {
    if (transactionResponse !== null) {
      setTransactionInProcess(false);
    }
  }, [transactionResponse]);

  async function submitTransaction<TFunctionName extends ModuleEntryFunctionNames<TModuleName>>(
    functionName: TFunctionName,
    args: ModuleEntryFunctions<TModuleName>[TFunctionName]["args"],
    tyArgs: ModuleEntryFunctions<TModuleName>[TFunctionName]["tyArgs"] = [],
  ): Promise<TransactionResponse> {
    if (!moduleAddress || !currentAccount) {
      const response: TransactionResponse = {
        transactionSubmitted: false,
        message: !moduleAddress ? "Module not found" : "No account connected",
      };
      setTransactionResponse(response);
      return response;
    }

    if (!normalizedModule) {
      const response: TransactionResponse = {
        transactionSubmitted: false,
        message: "Module information not loaded",
      };
      setTransactionResponse(response);
      return response;
    }

    const functionDetails = normalizedModule.exposedFunctions[functionName];
    if (!functionDetails) {
      const response: TransactionResponse = {
        transactionSubmitted: false,
        message: `Unknown function ${moduleName}::${functionName}`,
      };
      setTransactionResponse(response);
      return response;
    }

    setTransactionInProcess(true);

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${moduleAddress}::${moduleName}::${functionName}`,
        typeArguments: tyArgs ?? [],
        arguments: args.map((param, i) => {
          const paramType = functionDetails.parameters[i];
          const moveTypeSignature = normalizedTypeToMoveTypeSignature(paramType);
          const pureBcsSchema = getPureBcsSchema(moveTypeSignature.body);

          return pureBcsSchema ? pureBcsSchema.serialize(param) : tx.object(param);
        }),
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      console.log("result: ", result);

      if (result.effects?.status.status === "failure") {
        const response: TransactionResponse = {
          transactionSubmitted: true,
          transactionHash: result.digest,
          success: false,
          message: result.effects.status.error || "Transaction failed",
        };
        setTransactionResponse(response);
        return response;
      }

      const response: TransactionResponse = {
        transactionSubmitted: true,
        transactionHash: result.digest,
        success: true,
      };
      setTransactionResponse(response);
      return response;
    } catch (error) {
      const response: TransactionResponse = {
        transactionSubmitted: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
      setTransactionResponse(response);
      return response;
    }
  }

  function clearTransactionResponse() {
    setTransactionResponse(null);
  }

  return {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useScaffoldSubmitTransaction;
