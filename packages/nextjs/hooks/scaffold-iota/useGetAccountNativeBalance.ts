import { useEffect, useState } from "react";

export const useGetAccountNativeBalance = (address?: string) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);


  // useEffect(() => {
  //   const accountAddress = address || account?.address;
  //   if (!accountAddress) return;

  //   const fetchBalance = async () => {
  //     setLoading(true);
  //     setError(false);

  //     try {
  //       const result = await aptosClient.getAccountAPTAmount({ accountAddress });

  //       setBalance(result);
  //     } catch (e) {
  //       setError(true);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchBalance();
  // }, [address, account]);

  // return { balance, loading, error, nativeTokenSymbol: network.targetNetwork.native_token_symbol || "APT" };

  return { balance, loading, error, nativeTokenSymbol: "IOTA" };
};
