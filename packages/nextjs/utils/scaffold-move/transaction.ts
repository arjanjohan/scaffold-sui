import {
    getPureBcsSchema,
    normalizedTypeToMoveTypeSignature,
    Transaction,
    TransactionArgument
} from '@iota/iota-sdk/transactions';
import { type IotaMoveNormalizedType } from '@iota/iota-sdk/client';

interface MoveCallTransactionInput {
    objectId: string;
    target: string;
    typeArguments?: string[];
    arguments?: Array<{
        type: IotaMoveNormalizedType;
        value: any;
    }>;
}

export function createMoveCallTransaction({
    objectId,
    target,
    typeArguments = [],
    arguments: args = [],
}: MoveCallTransactionInput): Transaction {
    const tx = new Transaction();

    // Create the arguments array with objectId as first argument
    const moveCallArgs: TransactionArgument[] = [
        tx.object(objectId), // First argument is always the object ID
        ...args.map((param): TransactionArgument => {
            // If param is already a Transaction argument, return as is
            if (typeof param === 'object' && param !== null && 'Input' in param) {
                return param as unknown as TransactionArgument;
            }

            const moveTypeSignature = normalizedTypeToMoveTypeSignature(param.type);
            const pureBcsSchema = getPureBcsSchema(moveTypeSignature.body);

            return pureBcsSchema ? (pureBcsSchema.serialize(param.value) as unknown as TransactionArgument) : tx.object(param.value);
        })
    ];
    console.log("moveCallArgs: ", moveCallArgs);

    tx.moveCall({
        target,
        typeArguments,
        arguments: moveCallArgs,
    });

    return tx;
}