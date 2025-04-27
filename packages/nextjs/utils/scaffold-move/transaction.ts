import {
    getPureBcsSchema,
    normalizedTypeToMoveTypeSignature,
    Transaction,
} from '@iota/iota-sdk/transactions';

interface MoveCallTransactionInput {
    target: string;
    typeArguments?: string[];
    arguments?: Array<{
        type: string;
        value: any;
    }>;
}

export function createMoveCallTransaction({
    target,
    typeArguments = [],
    arguments: args = [],
}: MoveCallTransactionInput): Transaction {
    const tx = new Transaction();

    return tx.moveCall({
        target,
        typeArguments,
        arguments: args.map((param) => {
            // If param is already a Transaction object or similar, return as is
            if (typeof param === 'object' && param !== null && 'serialize' in param) {
                return param;
            }

            const moveTypeSignature = normalizedTypeToMoveTypeSignature(param.type);
            const pureBcsSchema = getPureBcsSchema(moveTypeSignature.body);

            return pureBcsSchema ? pureBcsSchema.serialize(param.value) : tx.object(param.value);
        }),
    });
}