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

export default function RevokeFreeze() {
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

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const handleRevokeFreeze = async () => {
    if (selectedToken) {
      try {
        const storedPublicKey = localStorage.getItem("publicKey");
        if (!storedPublicKey) {
          console.error("No public key found in local storage");
          return;
        }
        await updateAuthority(
          storedPublicKey, // assuming the public key is stored in the token object
          selectedToken.address,
          "revokeFreezeAuthority" as AuthorityType, // this is the authorityType for revoking freeze authority
          true
        );

        setModalInfo({
          show: true,
          title: "Revoke Freeze Success",
          message:
            "The owner's freeze authority has been revoked successfully.",
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
        title="Revoke Freeze Permissions for Solana Tokens on CoinForge"
        description="Boost your Solana tokens' autonomy by revoking freeze permissions with CoinForge. Assure holders that no central authority can freeze transactions, enhancing asset security and trust in a decentralized token ecosystem."
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
              Revoke Freeze Authority
            </h1>
          </div>
          <p className="mb-8 text-center text-gray-400">
            "Revoke Freeze Authority" on Solana tokens allows the token issuer
            to permanently remove the ability to freeze token transactions. This
            irreversible action enhances the token's decentralization and
            ensures no future restrictions can be imposed on the token's
            transferability.
          </p>

          <div id="sectionOne" className="">
            <SelectToken
              filterKey="revokeFreezeAuthority"
              onSelectionChange={setSelectedToken}
            />
            <button
              type="button"
              className="flex items-center justify-center w-full px-6 py-2 text-sm text-white transition duration-300 ease-in-out rounded-md bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
              onClick={handleRevokeFreeze}
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
