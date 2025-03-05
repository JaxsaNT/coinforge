import { useState, useEffect, ChangeEvent } from "react";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import Sidebar from "../components/Sidebar";
import DropdownList from "../components/form/DropdownList";
import TextInput from "../components/form/TextInput";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { BoltIcon } from "@heroicons/react/24/outline";
import SelectToken from "../components/form/SelectToken";
import { createTokenMarket } from "../api/solana/CreateMarketService";
import TransactionModal from "../components/TransactionModal";
import solanaIcon from "../assets/crypto-icons/solana.png";
import usdcIcon from "../assets/crypto-icons/usdc.png";

interface SelectedData {
  tokenAddress: string;
  tokenDecimals: number;
  quoteAddress: string;
  userPublicKey: string;
  tikSize: number;
  orderSize: number;
  eventQueueLength: string;
  requestQueueLength: string;
  orderbookLength: string;
}

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

interface MarketValues {
  eventQueueLength: string;
  requestQueueLength: string;
  orderbookLength: string;
  tickSize: number;
  orderSize: number;
}

const displayFields = [
  "eventQueueLength",
  "requestQueueLength",
  "orderbookLength",
];

const pairTokens: Token[] = [
  {
    name: "SOL",
    logo: solanaIcon,
    address: "So11111111111111111111111111111111111111112",
    symbol: "",
    description: "",
    twitter: "",
    discord: "",
    telegram: "",
    website: "",
    creatorName: "",
    creatorUrl: "",
    tags: [],
    revokeMintAuthority: false,
    revokeFreezeAuthority: false,
    revokeMutable: false,
    decimals: 0,
  },
  {
    name: "USDC",
    logo: usdcIcon,
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "",
    description: "",
    twitter: "",
    discord: "",
    telegram: "",
    website: "",
    creatorName: "",
    creatorUrl: "",
    tags: [],
    revokeMintAuthority: false,
    revokeFreezeAuthority: false,
    revokeMutable: false,
    decimals: 0,
  },
];

const presets: { [key: string]: MarketValues } = {
  "0.4": {
    eventQueueLength: "128",
    requestQueueLength: "63",
    orderbookLength: "201",
    tickSize: 0.0001,
    orderSize: 0.1,
  },
  "1.5": {
    eventQueueLength: "1400",
    requestQueueLength: "63",
    orderbookLength: "450",
    tickSize: 0.0001,
    orderSize: 0.1,
  },
  "2.8": {
    eventQueueLength: "2978",
    requestQueueLength: "63",
    orderbookLength: "909",
    tickSize: 0.0001,
    orderSize: 0.1,
  },
};

export default function CreateMarket() {
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });
  const [selectedPairToken, setSelectedPairToken] = useState<Token | null>(
    pairTokens[0] // Initialize with Solana token
  );
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [marketValues, setMarketValues] = useState<MarketValues>(
    presets["2.8"]
  );
  const [activeValue, setActiveValue] = useState<string>("2.8");
  const [totalPrice, setTotalPrice] = useState<string>("2.83");

  useEffect(() => {
    handleMarketValues("2.8");
  }, []);

  const updateValues = (value: string) => {
    handleMarketValues(value);
    setActiveValue(value);
    const basePrice = 0.03;
    const price = parseFloat(value) + basePrice;
    setTotalPrice(price.toFixed(2));
  };

  const handleMarketValues = (value: string) => {
    setMarketValues(presets[value]);
  };

  const buttonClass = (value: string) =>
    `w-20 px-3 py-2 text-sm font-semibold text-white rounded-md ${
      activeValue === value
        ? "bg-orange-500"
        : "bg-gray-800 hover:bg-orange-500"
    }`;

  const handleInputChange = (field: keyof MarketValues, value: string) => {
    setMarketValues((prevValues) => ({ ...prevValues, [field]: value }));
  };

  const handleCreateMarket = async () => {
    if (selectedToken) {
      try {
        const storedPublicKey = localStorage.getItem("publicKey");
        if (!storedPublicKey) {
          setModalInfo({
            show: true,
            title: "Public Key Not Found",
            message: "Please connect your wallet",
            type: "error",
          });
          setTimeout(() => {
            setModalInfo((prevModalInfo) => ({
              ...prevModalInfo,
              show: false,
            }));
          }, 4000);
          return;
        }
        const data: SelectedData = {
          tokenAddress: selectedToken?.address || "",
          tokenDecimals: selectedToken?.decimals || 0,
          quoteAddress: selectedPairToken?.address || "",
          userPublicKey: localStorage.getItem("publicKey") || "",
          tikSize: marketValues.tickSize,
          orderSize: marketValues.orderSize,
          eventQueueLength: marketValues.eventQueueLength,
          requestQueueLength: marketValues.requestQueueLength,
          orderbookLength: marketValues.orderbookLength,
        };
        const response = await createTokenMarket(data);

        setModalInfo({
          show: true,
          title: "Market Created",
          message:
            "Your market has been created, please add liquidity, this is your market ID: " +
            response,
          type: "success",
        });

        return;
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
              Create Openbook Market
            </h1>
          </div>
          <p className="mb-8 text-center text-gray-400">
            On the Create Openbook Market page, you can launch a market for your
            token to enable trading. Openbook charges a one off fee for storage
            and computation resources, we have added some recommened presets if
            you want to save some SOL.
          </p>
          <div id="sectionOne">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <SelectToken onSelectionChange={setSelectedToken} />
              <DropdownList
                tokens={pairTokens}
                label="Select Pair Token"
                selected={selectedPairToken}
                onSelectionChange={setSelectedPairToken}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <TextInput
                id="minimumTickSize"
                label="Minimum Tick Size*"
                placeholder="1"
                type="number"
                maxLength={10}
                value={marketValues.tickSize.toString()} // Convert number to string
                onChange={(e) =>
                  setMarketValues((prevTokenData) => ({
                    ...prevTokenData,
                    tickSize: parseFloat(e.target.value),
                  }))
                }
              />
              <TextInput
                id="minimumOrderSize"
                label="Minimum Order Size*"
                placeholder="0.001"
                type="number"
                maxLength={10}
                value={marketValues.orderSize.toString()} // Convert number to string
                onChange={(e) =>
                  setMarketValues((prevTokenData) => ({
                    ...prevTokenData,
                    orderSize: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <h2 className="mb-4">Advanced Settings</h2>
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
                    Attention needed
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Do not edit the advanced fields without understanding the
                      implications. Incorrect values can lead to market
                      instability and loss of funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4 mb-4 border border-gray-500 border-dashed rounded-md">
              {displayFields.map((field) => (
                <TextInput
                  key={field}
                  id={field}
                  label={field.replace(/([A-Z])/g, " $1").trim()}
                  placeholder="Enter length"
                  type="number"
                  maxLength={10}
                  value={marketValues[field as keyof MarketValues].toString()} // Convert value to string
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(
                      field as keyof MarketValues,
                      e.target.value
                    )
                  }
                />
              ))}
            </div>
            <div className="flex space-x-4">
              {Object.keys(presets).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={buttonClass(value)}
                  onClick={() => updateValues(value)}
                >
                  {value} Sol
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center justify-center w-full px-6 py-2 mt-4 text-sm text-white transition duration-300 ease-in-out rounded-md bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
              onClick={handleCreateMarket}
            >
              <BoltIcon className="w-6 mr-1" /> Proceed
            </button>
            <div className="mt-4 text-xs text-center text-gray-500">
              Price <span className="text-green-600">{totalPrice} SOL</span> +
              tx fees
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
