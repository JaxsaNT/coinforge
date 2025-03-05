import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { SocialIcon } from "react-social-icons";
import { BoltIcon } from "@heroicons/react/24/outline";
import Tags from "../components/form/Tags";
import CreatorInfo from "../components/form/Creator";
import Review from "../components/form/Review";
import Footer from "../components/Footer";
import TextInput from "../components/form/TextInput";
import PageHeader from "../components/PageHeader";
import { SubmitTokenData } from "../api/solana/CreateTokenService";
import Confetti from "react-confetti";
import Banner from "../components/Banner";
import Sidebar from "../components/Sidebar";
import TransactionModal from "../components/TransactionModal";
import { useCluster } from "../context/ClusterContext";
import { GetUserTokens } from "../api/solana/GetUserTokenService";
import { useTokenData } from "../context/GetUserTokens";

export default function CreateToken() {
  interface createdTokenData {
    publicKey: string;
    tokenName: string;
    tokenTicker: string;
    description: string;
    logo: File | null;
    tags: string[];
    website: string;
    twitter: string;
    discord: string;
    telegram: string;
    totalSupply: number;
    decimals: number;
    revokeFreezeAuth: boolean;
    revokeMintAuth: boolean;
    makeImmutable: boolean;
    creatorName: string;
    creatorUrl: string;
  }
  const [publicKey, setPublicKey] = useState<string>("");
  const { selectedCluster } = useCluster();
  const [currentSection, setCurrentSection] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [creatorName] = useState("CoinForge");
  const [creatorUrl] = useState("www.coinforge.me");
  const [revokeFreezeAuth, setRevokeFreezeAuth] = useState(false);
  const [revokeMintAuth, setRevokeMintAuth] = useState(false);
  const [makeImmutable, setMakeImmutable] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const { setTokenData } = useTokenData();
  const [createdTokenData, setCreatedTokenData] = useState<createdTokenData>({
    publicKey: localStorage.getItem("publicKey") || "",
    tokenName: "",
    tokenTicker: "",
    description: "",
    logo: null,
    tags: [],
    website: "",
    twitter: "",
    discord: "",
    telegram: "",
    totalSupply: 100000000,
    decimals: 6,
    revokeFreezeAuth: false,
    revokeMintAuth: false,
    makeImmutable: false,
    creatorName: "CoinForge",
    creatorUrl: "www.coinforge.me",
  });

  const [totalCost, setTotalCost] = useState(0.15);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const [isCreatorVisible, setIsCreatorVisible] = useState(false);

  const toggleCreatorVisibility = () => {
    setIsCreatorVisible(!isCreatorVisible);
  };

  const resetCreatorDetails = () => {
    setCreatedTokenData((prevTokenData) => ({
      ...prevTokenData,
      creatorName: "CoinForge", // Reset creator name to default
      creatorUrl: "www.coinforge.me", // Reset creator URL to default
    }));
  };

  const updateTags = (tags: string[]) => {
    setCreatedTokenData((prevTokenData) => ({
      ...prevTokenData,
      tags: tags,
    }));
  };

  useEffect(() => {
    if (!isCreatorVisible) {
      resetCreatorDetails(); // Reset creator details when visibility becomes false
    }
    try {
      const storedPublicKey = localStorage.getItem("publicKey");
      if (storedPublicKey) {
        setPublicKey(storedPublicKey);
      }
    } catch (error) {
      console.error("Error accessing local storage:", error);
    }
  }, [isCreatorVisible]);

  useEffect(() => {
    let cost = 0;
    if (revokeFreezeAuth) cost += 0.03;
    if (revokeMintAuth) cost += 0.03;
    if (makeImmutable) cost += 0.03;

    // Adjust cost based on the visibility of the Creator component
    if (isCreatorVisible) cost += 0.5;

    setTotalCost(cost);
  }, [revokeFreezeAuth, revokeMintAuth, makeImmutable, isCreatorVisible]);

  const [steps, setSteps] = useState([
    {
      id: "Step 1",
      name: "Token Details",
      href: "#",
      status: "current",
      index: 0,
    },
    {
      id: "Step 2",
      name: "Token Options",
      href: "#",
      status: "upcoming",
      index: 1,
    },
    { id: "Step 3", name: "Review", href: "#", status: "upcoming", index: 2 },
  ]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogo(null);
      setLogoPreviewUrl(null);
    }
  };

  const handleProceedClick = async () => {
    let missingFields = [];
    if (currentSection === 1) {
      if (!createdTokenData.tokenName) missingFields.push("Token Name");
      if (!createdTokenData.tokenTicker) missingFields.push("Token Ticker");
    } else if (currentSection === 2) {
      if (!createdTokenData.totalSupply || createdTokenData.totalSupply <= 0)
        missingFields.push("Initial Supply (must be greater than 0)");
      if (!createdTokenData.decimals || createdTokenData.decimals <= 0)
        missingFields.push("Decimals (cannot be negative)");
    }

    if (missingFields.length > 0) {
      setModalInfo({
        show: true,
        title: "Missing Required Fields",
        message: `Please complete all required fields in this section: ${missingFields.join(
          ", "
        )}.`,
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

    // Check if both steps 1 and 2 are complete before proceeding to submission
    if (
      !createdTokenData.tokenName ||
      !createdTokenData.tokenTicker ||
      !createdTokenData.totalSupply ||
      !createdTokenData.decimals
    ) {
      setModalInfo({
        show: true,
        title: "Incomplete Steps",
        message: "Please complete all steps before submitting.",
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

    if (currentSection === steps.length) {
      try {
        console.log(createdTokenData);

        await SubmitTokenData(createdTokenData);
        if (publicKey && selectedCluster) {
          setTokenData([]);
          GetUserTokens(publicKey, selectedCluster)
            .then((data) => {
              setTokenData(data);
            })
            .catch(console.error);
        }
        setModalInfo({
          show: true,
          title: "Token Created",
          message:
            "Your token was created successfully! You can view it on the Solana Explorer or your wallet.",
          type: "success",
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } catch (error) {
        console.error("Failed to submit token:", error);
        setModalInfo({
          show: true,
          title: "Submission Error",
          message:
            "There was an error creating your token, please check your available funds and ensure all fields are correct.",
          type: "error",
        });
      }
    } else {
      // Move to the next section if the current section is not the final section
      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);

      // Update the status of the completed step
      setSteps((prevSteps) =>
        prevSteps.map((step, index) => {
          return {
            ...step,
            status: index === currentSection ? "complete" : step.status,
          };
        })
      );
    }
  };

  const handleStepClick = (clickedStepIndex: number) => {
    // Prevent proceeding beyond the final step
    if (clickedStepIndex >= steps.length) {
      return;
    }

    setCurrentSection(clickedStepIndex + 1);

    // Update the status of the steps
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => {
        return {
          ...step,
          status:
            index === clickedStepIndex
              ? "current"
              : index < clickedStepIndex
              ? "complete"
              : "upcoming",
        };
      })
    );
  };

  useEffect(() => {
    let publicKey = localStorage.getItem("publicKey");
    if (!publicKey) {
      return;
    }

    setCreatedTokenData((prevState) => ({
      ...prevState,
      publicKey: publicKey,
      revokeFreezeAuth: revokeFreezeAuth,
      revokeMintAuth: revokeMintAuth,
      makeImmutable: makeImmutable,
      creatorName: creatorName,
      creatorUrl: creatorUrl,
      logo: logo,
    }));
  }, [
    revokeFreezeAuth,
    revokeMintAuth,
    makeImmutable,
    creatorName,
    creatorUrl,
    logo,
  ]);

  return (
    <>
      <PageHeader
        title="Create Solana Tokens Quickly and Securely - CoinForge"
        description="Launch your Solana token quickly with CoinForge's easy tool. Our platform offers a fast, secure, and simple creation process. Focus on your project, and start your token journey with confidence today!"
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
      <main className="px-4 py-12 lg:pl-72">
        <div className="w-full mx-auto mb-12 sm:px-6 lg:px-8 lg:w-10/12 xl:w-8/12">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-red-600">
              Create Token
            </h1>
          </div>
          <p className="mb-8 text-center">
            Launch your token on Solana in just 3 simple steps.
          </p>

          <nav aria-label="Progress" className="mb-8">
            <ol
              role="list"
              className="space-y-4 md:flex md:space-x-8 md:space-y-0"
            >
              {steps.map((step) => (
                <li
                  key={step.name}
                  className="md:flex-1"
                  onClick={() => handleStepClick(step.index)}
                >
                  {step.status === "complete" ? (
                    <a
                      href={step.href}
                      className="flex flex-col py-2 pl-4 border-l-4 border-orange-600 group hover:border-orange-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                    >
                      <span className="text-sm font-medium text-orange-600 group-hover:text-orange-800">
                        {step.id}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {step.name}
                      </span>
                    </a>
                  ) : step.status === "current" ? (
                    <a
                      href={step.href}
                      className="flex flex-col py-2 pl-4 border-l-4 border-orange-600 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                      aria-current="step"
                    >
                      <span className="text-sm font-medium text-orange-600">
                        {step.id}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {step.name}
                      </span>
                    </a>
                  ) : (
                    <a
                      href={step.href}
                      className="flex flex-col py-2 pl-4 border-l-4 border-gray-200 group hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                    >
                      <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                        {step.id}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {step.name}
                      </span>
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div id="sectionOne" className={currentSection === 1 ? "" : "hidden"}>
            <div className="flex gap-4 mb-4 col-2">
              <TextInput
                id="tokenName"
                label="Token Name*"
                placeholder="Floki"
                type="text"
                maxLength={30}
                value={createdTokenData.tokenName}
                onChange={(e) =>
                  setCreatedTokenData((prevTokenData) => ({
                    ...prevTokenData,
                    tokenName: e.target.value,
                  }))
                }
              />
              <TextInput
                id="tokenTicker"
                label="Token Ticker*"
                placeholder="FLOKI"
                type="text"
                maxLength={10}
                value={createdTokenData.tokenTicker}
                onChange={(e) =>
                  setCreatedTokenData((prevTokenData) => ({
                    ...prevTokenData,
                    tokenTicker: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex mb-4 col-1">
              <div className="w-full p-2 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
                <label
                  htmlFor="tokenTicker"
                  className="block text-xs font-medium text-gray-500"
                >
                  Description (Optional)
                </label>
                <textarea
                  required
                  name="description"
                  id="description"
                  className="block w-full p-0 bg-gray-900 border-0 text-gray-50 placeholder:text-gray-700 focus:ring-0"
                  placeholder="Floki coin is the cryptocurrency of Floki Inu (FLOKI), a meme token that became popular due to the influence of Elon Musk."
                  value={createdTokenData.description}
                  onChange={(e) =>
                    setCreatedTokenData((prevTokenData) => ({
                      ...prevTokenData,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex mb-4 col-1">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="logo"
                  className="flex flex-col items-center justify-center w-full transition duration-500 bg-gray-900 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer h-52 hover:bg-gray-800 hover:border-gray-500"
                >
                  {logoPreviewUrl ? (
                    <>
                      <img
                        src={logoPreviewUrl}
                        alt="Logo preview"
                        className="object-cover w-40 h-40 m-5 rounded-full"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Upload your logo</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, or GIF (min. 128x128px)
                      </p>
                    </div>
                  )}
                  <input
                    id="logo"
                    type="file"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="w-full p-2 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
                <label
                  htmlFor="websiteSocial"
                  className="block text-xs font-medium text-gray-500"
                >
                  Website
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <SocialIcon
                      url="www.coinforge.me"
                      style={{ height: 20, width: 20 }}
                    />
                  </div>
                  <input
                    type="url"
                    name="websiteSocial"
                    id="websiteSocial"
                    className="block w-full py-0 text-sm bg-gray-900 border-0 pl-7 text-gray-50 placeholder:text-gray-700 focus:ring-0"
                    placeholder="www.coinforge.me"
                    value={createdTokenData.website}
                    onChange={(e) =>
                      setCreatedTokenData((prevTokenData) => ({
                        ...prevTokenData,
                        website: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="w-full p-2 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
                <label
                  htmlFor="twitterSocial"
                  className="block text-xs font-medium text-gray-500"
                >
                  Twitter
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <SocialIcon
                      url="www.twitter.com"
                      style={{ height: 20, width: 20 }}
                    />
                  </div>
                  <input
                    type="url"
                    name="twitterSocial"
                    id="twitterSocial"
                    className="z-10 block w-full py-0 text-sm bg-gray-900 border-0 pl-7 text-gray-50 placeholder:text-gray-700 focus:ring-0"
                    placeholder="www.twitter.com/coinforge"
                    value={createdTokenData.twitter}
                    onChange={(e) =>
                      setCreatedTokenData((prevTokenData) => ({
                        ...prevTokenData,
                        twitter: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="w-full p-2 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
                <label
                  htmlFor="discordSocial"
                  className="block text-xs font-medium text-gray-500"
                >
                  Discord
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <SocialIcon
                      url="www.discord.com"
                      style={{ height: 20, width: 20 }}
                    />
                  </div>
                  <input
                    type="url"
                    name="discordSocial"
                    id="discordSocial"
                    className="z-10 block w-full py-0 text-sm bg-gray-900 border-0 pl-7 text-gray-50 placeholder:text-gray-700 focus:ring-0"
                    placeholder="www.discord.com/coinforge"
                    value={createdTokenData.discord}
                    onChange={(e) =>
                      setCreatedTokenData((prevTokenData) => ({
                        ...prevTokenData,
                        discord: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="w-full p-2 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
                <label
                  htmlFor="telegramSocial"
                  className="block text-xs font-medium text-gray-500"
                >
                  Telegram
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <SocialIcon
                      url="www.telegram.com"
                      style={{ height: 20, width: 20 }}
                    />
                  </div>
                  <input
                    type="url"
                    name="telegramSocial"
                    id="telegramSocial"
                    className="z-10 block w-full py-0 text-sm bg-gray-900 border-0 pl-7 text-gray-50 placeholder:text-gray-700 focus:ring-0"
                    placeholder="www.telegram.com/coinforge"
                    value={createdTokenData.telegram}
                    onChange={(e) =>
                      setCreatedTokenData((prevTokenData) => ({
                        ...prevTokenData,
                        telegram: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div id="sectionTwo" className={currentSection === 2 ? "" : "hidden"}>
            <div className="flex gap-4 mb-4 col-2">
              <div className="w-full p-2 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
                <label
                  htmlFor="totalSupply"
                  className="block text-xs font-medium text-gray-500"
                >
                  Total Supply*
                </label>
                <input
                  type="number"
                  name="totalSupply"
                  id="totalSupply"
                  className="z-10 block w-full p-0 bg-gray-900 border-0 text-gray-50 placeholder:text-gray-700 focus:ring-0"
                  placeholder="1,000,000"
                  value={createdTokenData.totalSupply}
                  onChange={(e) =>
                    setCreatedTokenData((prevTokenData) => ({
                      ...prevTokenData,
                      totalSupply: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="w-full p-2 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
                <label
                  htmlFor="tokenDecimals"
                  className="block text-xs font-medium text-gray-500"
                >
                  Decimals*
                </label>
                <input
                  type="number"
                  name="tokenDecimals"
                  id="tokenDecimals"
                  className="block w-full p-0 bg-gray-900 border-0 text-gray-50 placeholder:text-gray-700 focus:ring-0"
                  placeholder="9"
                  value={createdTokenData.decimals}
                  onChange={(e) =>
                    setCreatedTokenData((prevTokenData) => ({
                      ...prevTokenData,
                      decimals: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 p-8 mb-4 bg-gray-800 rounded-md md:grid-cols-3">
              <Switch.Group as="div" className="flex items-center">
                <Switch
                  checked={revokeFreezeAuth}
                  onChange={setRevokeFreezeAuth}
                  className={`${
                    revokeFreezeAuth ? "bg-orange-500" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      revokeFreezeAuth ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
                <Switch.Label
                  as="span"
                  className="flex flex-col ml-3 text-sm font-medium text-gray-100"
                >
                  Revoke Freeze Auth{" "}
                  <span className="text-xs font-light text-green-500">
                    (0.03 SOL)
                  </span>{" "}
                </Switch.Label>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center">
                <Switch
                  checked={revokeMintAuth}
                  onChange={setRevokeMintAuth}
                  className={`${
                    revokeMintAuth ? "bg-orange-500" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      revokeMintAuth ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
                <Switch.Label
                  as="span"
                  className="flex flex-col ml-3 text-sm font-medium text-gray-100"
                >
                  Revoke Mint Auth
                  <span className="text-xs font-light text-green-500">
                    (0.03 SOL)
                  </span>
                </Switch.Label>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center">
                <Switch
                  checked={makeImmutable}
                  onChange={setMakeImmutable}
                  className={`${
                    makeImmutable ? "bg-orange-500" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      makeImmutable ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
                <Switch.Label
                  as="span"
                  className="flex flex-col ml-3 text-sm font-medium text-gray-100"
                >
                  Make Immutable
                  <span className="text-xs font-light text-green-500">
                    (0.03 SOL)
                  </span>
                </Switch.Label>
              </Switch.Group>
            </div>

            <div className="flex gap-4 mb-4 col-1">
              <Tags updateTags={updateTags} />
            </div>
            <div className="gap-4 mb-4">
              <CreatorInfo
                toggleVisibility={toggleCreatorVisibility}
                creatorName={createdTokenData.creatorName}
                creatorUrl={createdTokenData.creatorUrl}
                onNameChange={(e) =>
                  setCreatedTokenData((prevTokenData) => ({
                    ...prevTokenData,
                    creatorName: e.target.value,
                  }))
                }
                onUrlChange={(e) =>
                  setCreatedTokenData((prevTokenData) => ({
                    ...prevTokenData,
                    creatorUrl: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div
            id="sectionThree"
            className={currentSection === 3 ? "" : "hidden"}
          >
            <Review tokenData={createdTokenData} />
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-full px-6 py-2 mt-4 text-sm text-white transition duration-300 ease-in-out rounded-md bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
            onClick={handleProceedClick}
          >
            <BoltIcon className="w-6 mr-1" /> Proceed
          </button>
          {showConfetti && <Confetti recycle={false} />}
          <div className="mt-4 text-sm text-center text-gray-500">
            Price
            <span className="text-green-500">
              {" "}
              {totalCost.toFixed(2)} SOL
            </span>{" "}
            + Solana Network Fee's
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
