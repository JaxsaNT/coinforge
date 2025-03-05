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

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

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

        setModalInfo({
          show: true,
          title: "Made Immutable",
          message: "This token is now immutable. Its rules cannot be changed.",
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
        title="Solidify Your Solana Token Rules - Make Tokens Immutable on CoinForge"
        description="Make your Solana tokens immutable with CoinForge to secure their functionalities against changes, ensuring transparency and reliability for holders. Ideal for issuers seeking unmatched asset assurance and integrity."
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
              Make Immutable
            </h1>
          </div>
          <p className="mb-8 text-center text-gray-400">
            The "Make Immutable" action on Solana tokens is a process where the
            token issuer permanently disables the ability to update the token's
            program, ensuring that the token's rules and behaviors cannot be
            altered in the future. This enhances the security and predictability
            of the token.
          </p>

          <div id="sectionOne" className="">
            <SelectToken
              filterKey="revokeMutable"
              onSelectionChange={setSelectedToken}
            />
            <button
              type="button"
              className="flex items-center justify-center w-full px-6 py-2 text-sm text-white transition duration-300 ease-in-out rounded-md bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
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
