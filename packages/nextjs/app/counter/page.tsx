"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useIotaClient,
  useIotaClientQuery,
} from "@iota/dapp-kit";
import { Address } from "~~/components/scaffold-move";
import { useGetAccountResource } from "~~/hooks/scaffold-move";
import { useGetModule } from "~~/hooks/scaffold-move/useGetModule";
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction";
import { useView } from "~~/hooks/scaffold-move/useView";
import { AddressInput } from "~~/types/scaffold-move";

// Alert Component for showing error messages or warnings
const Alert = ({ message }: { message: string }) => (
  <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
    <p className="text-3xl mt-14">{message}</p>
  </div>
);

const CounterPage: NextPage = () => {
  const account = useCurrentAccount();
  const [newValue, setNewValue] = useState<string>("");
  const [counterValue, setCounterValue] = useState<number | null>(null);

  const { submitTransaction, transactionResponse, transactionInProcess } = useSubmitTransaction("counter");

  const moveModule = useGetModule("counter");
  const counterAbi = moveModule?.abi;

  const { data: counterResource, refetch: refetchCounter } = useGetAccountResource("counter", "Counter");

  const {
    data: counterView,
    isLoading: isLoadingCounterView,
    refetch: refetchCounterView,
  } = useView({
    moduleName: "counter",
    functionName: "value",
    args: [account?.address?.toString() as AddressInput],
  });

  // If the counterModule or ABI is not found, show an alert message and return early
  if (!counterAbi) {
    return <Alert message="Counter module not found!" />;
  }

  // Create a new counter
  const createCounter = async () => {
    try {
      await submitTransaction("create", []);
      await refetchCounter();
    } catch (error) {
      console.error("Error creating counter:", error);
    }
  };

  // Increment the counter
  const incrementCounter = async () => {
    try {
      await submitTransaction("increment", []);
      await refetchCounter();
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  };

  // Set counter value (only owner)
  const handleSetValue = async () => {
    if (!newValue) {
      console.error("New value is missing");
      return;
    }

    try {
      await submitTransaction("set_value", [parseInt(newValue)]);
      await refetchCounter();
      setNewValue("");
    } catch (error) {
      console.error("Error setting counter value:", error);
    }
  };

  // Delete counter (only owner)
  const deleteCounter = async () => {
    try {
      await submitTransaction("delete", []);
      await refetchCounter();
    } catch (error) {
      console.error("Error deleting counter:", error);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow">
      <div className="flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl p-6 mt-8 w-full max-w-lg">
        <div className="text-xl">IOTA Move Counter</div>
        <p className="text-sm mb-2">A simple shared counter on the IOTA blockchain.</p>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={account?.address?.toString()} />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mt-8 w-full max-w-lg">
        <h2 className="text-lg font-semibold">Counter Controls</h2>
        <p className="text-sm">Create and interact with a shared counter on the IOTA blockchain.</p>

        <button className="btn btn-secondary mt-2" disabled={!account} onClick={createCounter}>
          Create Counter
        </button>

        <button className="btn btn-secondary mt-2" disabled={!account} onClick={incrementCounter}>
          Increment Counter
        </button>

        <div className="w-full flex flex-col space-y-2">
          <input
            type="number"
            placeholder="Enter new value"
            className="input input-bordered w-full"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button className="btn btn-secondary mt-2" disabled={!account} onClick={handleSetValue}>
            Set Value (Owner Only)
          </button>
        </div>

        <button className="btn btn-warning mt-2" disabled={!account} onClick={deleteCounter}>
          Delete Counter (Owner Only)
        </button>
      </div>

      <div className="flex flex-col items-center space-y-4 bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mt-8 w-full max-w-lg">
        <h2 className="text-lg font-semibold">Counter Value</h2>
        <p className="text-sm">
          Current value from the blockchain using{" "}
          <Link
            className="underline"
            href="https://scaffold-move-docs.vercel.app/hooks/usegetaccountresource"
            target="_blank"
            rel="noopener noreferrer"
          >
            useGetAccountResource
          </Link>
        </p>
        <button className="btn btn-secondary mt-2" disabled={!account} onClick={() => refetchCounter()}>
          Refresh Counter Value
        </button>

        {counterResource && !transactionInProcess && (
          <div className="text-2xl font-bold">
            Value: {counterResource.value}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-4 bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mt-8 w-full max-w-lg">
        <h2 className="text-lg font-semibold">View Counter</h2>
        <p className="text-sm">
          Read counter value using the view function with{" "}
          <Link
            className="underline"
            href="https://scaffold-move-docs.vercel.app/hooks/useview"
            target="_blank"
            rel="noopener noreferrer"
          >
            useView
          </Link>
        </p>
        <button className="btn btn-secondary mt-2" disabled={!account} onClick={() => refetchCounterView()}>
          View Counter
        </button>

        {counterView && !isLoadingCounterView && (
          <div className="text-2xl font-bold">
            Value: {counterView}
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterPage;
