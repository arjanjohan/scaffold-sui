import { getFormattedBalanceStr } from "~~/utils/scaffold-iota/ContentValue/CurrencyValue";
import { IOTA_TYPE_ARG } from "@iota/iota-sdk/utils";
import { useGetCoinBalance } from "~~/hooks/scaffold-iota";

type BalanceProps = {
  address: string;
  decimals?: number;
  coinType?: string;
};

export const Balance = ({ address, decimals = 10, coinType = IOTA_TYPE_ARG }: BalanceProps) => {
  const { balance, isLoading, isError } = useGetCoinBalance(coinType, address);

  if (isLoading) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-2 border-gray-400 rounded-md px-2 flex flex-col items-center max-w-fit cursor-pointer">
        <div className="text-warning">Error</div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center">
      <>
        <span>{getFormattedBalanceStr(balance.toString(), decimals)}</span>
        <span className="text-[0.8em] font-bold ml-1">IOTA</span>
      </>
    </div>
  );
};
