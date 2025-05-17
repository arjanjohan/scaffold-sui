"use client";

import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type { NextPage } from "next";
import { BookOpenIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-sui";
import { useTargetNetwork } from "~~/hooks/scaffold-sui/useTargetNetwork";
import { getObjectUrl } from "~~/utils/scaffold-sui/getExplorerPaths";
import { modules } from "~~/utils/scaffold-sui/module";

const Home: NextPage = () => {
  const account = useCurrentAccount();
  const { targetNetwork } = useTargetNetwork();
  const networkModules = modules[targetNetwork.id];
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold Sui</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={account?.address} />
          </div>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your Move module{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              counter.move
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/move/sources
            </code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BookOpenIcon className="h-8 w-8 fill-secondary" />
              <p>
                Learn about all Scaffold Sui features and how to use them on the{" "}
                <Link href="/docs" passHref className="link">
                  Documentation
                </Link>{" "}
                page.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the {/* <Link href="/blockexplorer" passHref className="link"> */}
                Block Explorer {/* </Link>{" "} */}
                tab. <b>Coming soon...</b>
              </p>
            </div>
          </div>
        </div>

        <div className="flex-grow px-8 py-12">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center">Your Deployed Modules on {targetNetwork.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {networkModules ? (
                Object.entries(networkModules).map(([moduleName, module]) => (
                  <Link
                    key={moduleName}
                    href={getObjectUrl(module.address, targetNetwork.id, undefined, moduleName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="bg-base-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="text-lg font-semibold mb-2">{moduleName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Address:</span>
                        <Address address={module.address} disableAddressLink={true} />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center">No modules deployed on {targetNetwork.id}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
