import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import SelectToken from "../components/form/SelectToken";
import { BoltIcon } from "@heroicons/react/24/outline";
import {
  updateAuthority,
  AuthorityType,
} from "../api/solana/UpdateAuthorityService";
import { useState } from "react";
import Banner from "../components/Banner";
import Sidebar from "../components/Sidebar";
import TextInput from "../components/form/TextInput";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";

export default function MakeImmutable() {
  interface Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    description: string;
    logo: string;
    twitter: string;
    discord: string;
    telegram: string;
    website: string;
    creatorName: string;
    creatorUrl: string;
    tags: string[];
    revokeMintAuthority: boolean;
    revokeFreezeAuthority: boolean;
    revokeMutable: boolean;
  }

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const handleRevokeImmutable = async () => {
    if (selectedToken) {
      try {
        const storedPublicKey = localStorage.getItem("publicKey");
        if (!storedPublicKey) {
          console.error("No public key found in local storage");
          return;
        }
        await updateAuthority(
          storedPublicKey,
          selectedToken.address,
          "revokeMutable" as AuthorityType,
          true
        );
      } catch (error) { }
    }
  };
  return (
    <>
      <PageHeader
        title="Solidify Your Solana Token Rules - Make Tokens Immutable on CoinForge"
        description="Make your Solana tokens immutable with CoinForge to secure their functionalities against changes, ensuring transparency and reliability for holders. Ideal for issuers seeking unmatched asset assurance and integrity."
      />
      <Sidebar />
      <Banner />
      <main className="h-full px-4 py-12 lg:pl-72">
        <div className="w-full mx-auto mb-12 sm:px-6 lg:px-8 lg:w-10/12 xl:w-8/12">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-red-600">
              Mint Tokens
            </h1>
          </div>
          <p className="mb-8 text-center text-gray-400">
            This form allows you to mint additional tokens for an existing
            Solana blockchain token. Specify the amount and confirm with the
            necessary permissions. This process increases the token's total
            supply.
          </p>

          <div className="p-4 mb-4 rounded-md bg-yellow-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon
                  className="w-5 h-5 text-yellow-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Under Development
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>This is under development and is coming soon.</p>
                </div>
              </div>
            </div>
          </div>

          <div id="sectionOne" className="">
            <SelectToken
              filterKey="revokeMutable"
              onSelectionChange={setSelectedToken}
            />
            <TextInput
              id="mintAmount"
              label="Mint Amount*"
              placeholder="1000000"
              type="number"
              maxLength={18}
            />
            <button
              type="button"
              className="flex items-center justify-center w-full px-6 py-2 mt-4 text-sm text-white transition duration-300 ease-in-out rounded-md bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
              onClick={handleRevokeImmutable}
            >
              <BoltIcon className="w-6 mr-1" /> Proceed
            </button>

            <div className="mt-4 text-xs text-center text-gray-500">
              Price <span className="text-green-600">0.03 SOL</span> + tx fees
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
