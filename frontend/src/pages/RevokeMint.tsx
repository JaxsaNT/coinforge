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
import TransactionModal from "../components/TransactionModal";

export default function RevokeMint() {
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

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const handleRevokeMint = async () => {
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
          "revokeMintAuthority" as AuthorityType,
          true
        );

        setModalInfo({
          show: true,
          title: "Revoke Mint Success",
          message: "The owner's mint authority has been revoked successfully.",
          type: "success",
        });
        setTimeout(() => {
          setModalInfo((prevModalInfo) => ({
            ...prevModalInfo,
            show: false,
          }));
        }, 4000);
      } catch (error) {}
    }
  };

  return (
    <>
      <PageHeader
        title="Secure Your Solana Tokens: Stop Minting with CoinForge"
        description="Control your Solana token supply with CoinForge by revoking minting permissions. Prevent further minting to preserve token scarcity and value. Our secure, user-friendly platform makes managing your token's lifecycle and ensuring its stability easy."
      />
      <Sidebar />
      <Banner />
      {modalInfo.show && (
        <TransactionModal
          title={modalInfo.title}
          message={modalInfo.message}
          type={modalInfo.type as "info" | "success" | "error" | "waiting"}
        />
      )}
      <main className="h-full px-4 py-12 lg:pl-72">
        <div className="w-full mx-auto mb-12 sm:px-6 lg:px-8 lg:w-10/12 xl:w-8/12">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-red-600">
              Revoke Mint Authority
            </h1>
          </div>
          <p className="mb-8 text-center text-gray-400">
            "Revoke Mint Auth" on Solana tokens is an operation where the token
            issuer permanently relinquishes the ability to mint new tokens,
            ensuring a fixed supply and enhancing the token's economic
            stability.
          </p>

          <div id="sectionOne" className="">
            <SelectToken
              filterKey="revokeMintAuthority"
              onSelectionChange={setSelectedToken}
            />
            <button
              type="button"
              className="flex items-center justify-center w-full px-6 py-2 text-sm text-white transition duration-300 ease-in-out rounded-md bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
              onClick={handleRevokeMint}
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
