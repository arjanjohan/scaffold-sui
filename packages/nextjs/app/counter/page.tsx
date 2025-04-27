"use client";

import { useState } from "react";
import { useCurrentAccount } from "@iota/dapp-kit";
import { NextPage } from "next";
import { Address } from "~~/components/scaffold-iota";
import { useGetObject } from "~~/hooks/scaffold-iota/useGetObject";
import useSubmitTransaction from "~~/hooks/scaffold-iota/useSubmitTransaction";

const CounterPage: NextPage = () => {
  const moduleName = "counter";
  const moduleAddress = "0xd5b0600278eaeb8c930bebc86e9b1565a4550eb0ca12db2044f46e281c731e81"; // TODO: Get this from deployments file

  const account = useCurrentAccount();
  const [newValue, setNewValue] = useState<string>("");
  const [manualObjectId, setManualObjectId] = useState<string>("");

  const { submitTransaction } = useSubmitTransaction(moduleName, moduleAddress);
  const { data: counterObject, refetch: refetchCounter } = useGetObject(manualObjectId);

  // Extract counter data
  const counterData = counterObject?.data?.content as { fields?: { value: number; owner: string } };
  const counterValue = counterData?.fields?.value;
  const counterOwner = counterData?.fields?.owner;

  // Helper function to handle transaction success
  const handleTransactionSuccess = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await refetchCounter();
  };

  // Create a new counter
  const createCounter = async () => {
    try {
      const result = await submitTransaction("create", []);
      if (result.transactionSubmitted && result.success) {
        await handleTransactionSuccess();
      }
    } catch (error) {
      console.error("Error creating counter:", error);
    }
  };

  // Increment the counter
  const incrementCounter = async () => {
    if (!manualObjectId) return;
    try {
      const result = await submitTransaction("increment", [manualObjectId]);
      if (result.transactionSubmitted && result.success) {
        await handleTransactionSuccess();
      }
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  };

  // Set counter value (only owner)
  const handleSetValue = async () => {
    if (!manualObjectId || !newValue) return;
    try {
      const result = await submitTransaction("set_value", [manualObjectId, parseInt(newValue)]);
      if (result.transactionSubmitted && result.success) {
        setNewValue("");
        await handleTransactionSuccess();
      }
    } catch (error) {
      console.error("Error setting counter value:", error);
    }
  };

  // Delete counter (only owner)
  const deleteCounter = async () => {
    if (!manualObjectId) return;
    try {
      const result = await submitTransaction("delete", [manualObjectId]);
      if (result.transactionSubmitted && result.success) {
        setManualObjectId("");
        await handleTransactionSuccess();
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
        <button className="btn btn-primary w-full max-w-xs" disabled={!account} onClick={createCounter}>
          Create Counter
        </button>
      </div>

      {/* Counter Controls Section */}
      <div className="flex flex-col items-center space-y-4 bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 mt-8 w-full max-w-lg">
        <h2 className="text-lg font-semibold">Counter Controls</h2>
        <p className="text-sm">Enter a counter object ID to interact with it.</p>

        <input
          type="text"
          placeholder="Enter counter object ID"
          className="input input-bordered w-full"
          value={manualObjectId}
          onChange={e => setManualObjectId(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4 w-full">
          <button className="btn btn-secondary" disabled={!account || !manualObjectId} onClick={() => refetchCounter()}>
            Refresh
          </button>
          <button className="btn btn-secondary" disabled={!account || !manualObjectId} onClick={incrementCounter}>
            Increment
          </button>
        </div>

        <div className="w-full space-y-2">
          <input
            type="number"
            placeholder="Enter new value"
            className="input input-bordered w-full"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
          />
          <button
            className="btn btn-secondary w-full"
            disabled={
              !account || !manualObjectId || !newValue || Boolean(counterOwner && counterOwner !== account?.address)
            }
            onClick={handleSetValue}
          >
            Set Value
          </button>
        </div>

        <button
          className="btn btn-warning w-full"
          disabled={!account || !manualObjectId || Boolean(counterOwner && counterOwner !== account?.address)}
          onClick={deleteCounter}
        >
          Delete Counter
        </button>

        {counterValue !== undefined && (
          <div className="mt-4 text-center">
            <p className="text-lg">Current Value: {counterValue}</p>
            <p className="text-sm">
              Owner: <Address address={counterOwner || ""} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterPage;
