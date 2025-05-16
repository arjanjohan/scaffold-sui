import { useTargetNetwork } from "~~/hooks/scaffold-sui/useTargetNetwork";
import { getTransactionUrl } from "~~/utils/scaffold-sui/getExplorerPaths";

interface TransactionResponseProps {
  transactionResponse: {
    transactionSubmitted: boolean;
    success?: boolean;
    transactionHash?: string;
    message?: string;
  } | null;
}

export interface TransactionResponseType {
  transactionSubmitted: boolean;
  success?: boolean;
  transactionHash?: string;
  message?: string;
}

export const TransactionResponse = ({ transactionResponse }: TransactionResponseProps) => {
  const { targetNetwork } = useTargetNetwork();
  if (!transactionResponse?.transactionSubmitted) return null;

  return (
    <div className="bg-base-300 rounded-3xl text-sm px-4 py-1.5 break-words overflow-auto">
      <pre className="whitespace-pre-wrap break-words text-center">
        {transactionResponse.success ? (
          <>
            ✅ transaction successful
            {transactionResponse.transactionHash && (
              <>
                <br />
                <a
                  href={getTransactionUrl(transactionResponse.transactionHash, targetNetwork.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  View on Explorer
                </a>
              </>
            )}
          </>
        ) : (
          <>
            ❌ transaction failed
            {transactionResponse.message && (
              <>
                <br />
                Error: {transactionResponse.message}
              </>
            )}
          </>
        )}
      </pre>
    </div>
  );
};
