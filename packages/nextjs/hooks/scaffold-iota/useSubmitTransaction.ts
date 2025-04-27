import { useEffect, useState } from "react";
import {
    useCurrentAccount,
    useIotaClient,
    useSignAndExecuteTransaction,
} from "@iota/dapp-kit";
import { Transaction } from '@iota/iota-sdk/transactions';
import { createMoveCallTransaction } from "~~/utils/scaffold-move/transaction";

export type TransactionResponse = TransactionResponseOnSubmission | TransactionResponseOnError;

// "submission" here means that the transaction is posted on chain and gas is paid.
// However, the status of the transaction might not be "success".
export type TransactionResponseOnSubmission = {
    transactionSubmitted: true;
    transactionHash: string;
    success: boolean; // indicates if the transaction submitted but failed or not
    message?: string; // error message if the transaction failed
};

export type TransactionResponseOnError = {
    transactionSubmitted: false;
    message: string;
};

interface MoveModuleABI {
    address: string;
}

interface MoveModule {
    abi: MoveModuleABI;
}

// This should be imported from your module types
type ModuleMap = {
    [key: string]: MoveModule;
};

// Mock implementation of useGetModule - replace with actual implementation
const useGetModule = (moduleName: string): MoveModule | undefined => {
    // Implementation should come from your module system
    return undefined;
};

const useSubmitTransaction = (moduleName: string) => {
    const [transactionResponse, setTransactionResponse] = useState<TransactionResponse | null>(null);
    const [transactionInProcess, setTransactionInProcess] = useState<boolean>(false);
    const [moduleAddress, setModuleAddress] = useState<string | null>(null);

    const currentAccount = useCurrentAccount();
    const iotaClient = useIotaClient();
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

    const moveModule = useGetModule(moduleName);

    useEffect(() => {
        if (moveModule) {
            setModuleAddress(moveModule.abi.address);
        }
    }, [moveModule]);

    useEffect(() => {
        if (transactionResponse !== null) {
            setTransactionInProcess(false);
        }
    }, [transactionResponse]);

    async function submitTransaction(
        functionName: string,
        args: Array<{ type: string; value: any }> = [],
        tyArgs: string[] = [],
    ) {
        if (!moduleAddress || !currentAccount) {
            setTransactionResponse({
                transactionSubmitted: false,
                message: !moduleAddress ? "Module not found" : "No account connected",
            });
            return;
        }

        setTransactionInProcess(true);

        try {
            const transaction = createMoveCallTransaction({
                target: `${moduleAddress}::${moduleName}::${functionName}`,
                typeArguments: tyArgs,
                arguments: args,
            });

            const result = await signAndExecuteTransaction({ transaction });

            if (result.effects?.status.status === 'failure') {
                setTransactionResponse({
                    transactionSubmitted: true,
                    transactionHash: result.digest,
                    success: false,
                    message: result.effects.status.error || 'Transaction failed',
                });
                return;
            }

            setTransactionResponse({
                transactionSubmitted: true,
                transactionHash: result.digest,
                success: true,
            });

        } catch (error) {
            setTransactionResponse({
                transactionSubmitted: false,
                message: error instanceof Error ? error.message : "Unknown error occurred",
            });
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

export default useSubmitTransaction;
