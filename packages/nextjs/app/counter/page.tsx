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
import { Address } from "~~/components/scaffold-iota";
import useSubmitTransaction from "~~/hooks/scaffold-iota/useSubmitTransaction";
import { useView } from "~~/hooks/scaffold-iota/useView";
import { AddressInput } from "~~/types/scaffold-iota";
import { createMoveCallTransaction } from "~~/utils/scaffold-move/transaction";
import { Transaction } from "@iota/iota-sdk/transactions";

// Alert Component for showing error messages or warnings
const Alert = ({ message }: { message: string }) => (
  <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
    <p className="text-3xl mt-14">{message}</p>
  </div>
);

const CounterPage: NextPage = () => {
  const moduleName = "counter";
  const moduleAddress = "0xd5b0600278eaeb8c930bebc86e9b1565a4550eb0ca12db2044f46e281c731e81"; // TODO: Get this from deployments file

  const account = useCurrentAccount();
  const [newValue, setNewValue] = useState<string>("");
  const [counterValue, setCounterValue] = useState<number | null>(null);
  const [counterId, setCounterId] = useState<string>("0x8b96708c3323b735113190e96ff9d42ff79bc9d6ea17f4f4b6ff202cee0624a6");

  const { submitTransaction, transactionResponse, transactionInProcess } = useSubmitTransaction(moduleName, moduleAddress);

  const {
    data: counterView,
    isLoading: isLoadingCounterView,
    refetch: refetchCounterView,
  } = useView({
    moduleName: "counter",
    functionName: "value",
    args: [account?.address?.toString() as AddressInput],
  });

  // Create a new counter
  const createCounter = async () => {
    try {
      const result = await submitTransaction("create", []);
      // Get the created counter ID from the transaction result
      if (result && 'transactionSubmitted' in result && result.transactionSubmitted && result.success) {
        // TODO: Extract counter ID from transaction result
        await refetchCounterView();
      }
    } catch (error) {
      console.error("Error creating counter:", error);
    }
  };

  // Increment the counter
  const incrementCounter = async () => {
    console.log("incrementCounter: ", counterId);
    if (!counterId) return;
    try {
      const result = await submitTransaction("increment", [counterId]);
      if (result.transactionSubmitted && result.success) {
        await refetchCounterView();
      }
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  };

  // Set counter value (only owner)
  const handleSetValue = async () => {
    if (!counterId || !newValue) return;
    try {
      const result = await submitTransaction("set_value", [counterId, parseInt(newValue)]);
      if (result.transactionSubmitted && result.success) {
        await refetchCounterView();
        setNewValue("");
      }
    } catch (error) {
      console.error("Error setting counter value:", error);
    }
  };

  // Delete counter (only owner)
  const deleteCounter = async () => {
    if (!counterId) return;
    try {
      const result = await submitTransaction("delete", [counterId]);
      if (result.transactionSubmitted && result.success) {
        await refetchCounterView();
        setCounterId("");
      }
    } catch (error) {
      console.error("Error deleting counter:", error);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow">
      {/* Contract Info Section */}
      <div className="flex flex-col items-center bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl p-6 mt-8 w-full max-w-lg">
        <div className="text-xl">IOTA Move Counter</div>
        <p className="text-sm mb-2">A simple shared counter on the IOTA blockchain.</p>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <p className="my-2 font-medium">Smart contract address:</p>
          <Address address={moduleAddress} />
        </div>
      </div>

      {/* Create Counter Section */}
      <div className="flex flex-col items-center space-y-4 bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mt-8 w-full max-w-lg">
        <h2 className="text-lg font-semibold">Create New Counter</h2>
        <p className="text-sm">Create a new shared counter on the IOTA blockchain.</p>
        <button
          className="btn btn-primary w-full max-w-xs"
          disabled={!account}
          onClick={createCounter}
        >
          Create Counter
        </button>
      </div>

      {/* Counter Controls Section */}
      <div className="flex flex-col items-center space-y-4 bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mt-8 w-full max-w-lg">
        <h2 className="text-lg font-semibold">Counter Controls</h2>
        <p className="text-sm">View and interact with an existing counter.</p>

        {/* Counter ID Input */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Enter Counter ID"
            className="input input-bordered w-full"
            value={counterId}
            onChange={(e) => setCounterId(e.target.value)}
          />
        </div>

        {/* Counter Value Display */}
        {counterView && !isLoadingCounterView && (
          <div className="text-2xl font-bold bg-base-200 px-6 py-3 rounded-xl w-full text-center">
            Value: {counterView}
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            className="btn btn-secondary"
            disabled={!account || !counterId}
            onClick={() => refetchCounterView()}
          >
            View Counter
          </button>
          <button
            className="btn btn-secondary"
            disabled={!account || !counterId}
            onClick={incrementCounter}
          >
            Increment
          </button>
        </div>

        {/* Set Value Controls */}
        <div className="w-full space-y-2">
          <input
            type="number"
            placeholder="Enter new value"
            className="input input-bordered w-full"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button
            className="btn btn-secondary w-full"
            disabled={!account || !counterId || !newValue}
            onClick={handleSetValue}
          >
            Set Value
          </button>
        </div>

        {/* Delete Button */}
        <button
          className="btn btn-warning w-full"
          disabled={!account || !counterId}
          onClick={deleteCounter}
        >
          Delete Counter
        </button>
      </div>
    </div>
  );
};

export default CounterPage;
