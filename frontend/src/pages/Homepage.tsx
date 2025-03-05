import { useState } from "react";
import { Dialog, Disclosure } from "@headlessui/react";
import {
  Bars3Icon,
  MinusSmallIcon,
  PlusSmallIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowPathIcon,
  CheckIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  FingerPrintIcon,
  LockClosedIcon,
  BoltIcon,
} from "@heroicons/react/20/solid";
import CoinForgeLogo from "../components/CoinForgeLogo";
import forgebeam from "../assets/forgebeam-lg.jpg";
import openbookLogo from "../assets/openbook.png";
import solanaLogo from "../assets/solana.png";
import ipfsLogo from "../assets/ipfs.png";
import raydiumLogo from "../assets/raydium.png";
import screenshot from "../assets/screenshot.png";
import prospector from "../assets/prospector.png";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";

const navigation = [
  { name: "Create Token", href: "/solana/create" },
  { name: "Make Immutable", href: "/solana/immute" },
  { name: "Revoke Freeze Auth", href: "/solana/revoke-freeze" },
  { name: "Revoke Mint Auth", href: "/solana/revoke-mint" },
];
const features = [
  {
    name: "IPFS Storage",
    description:
      "Meta data is automtically uploaded to IPFS, stored on the blockchain",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Secure & Private.",
    description:
      "Our app provides a secure and private environment for your tokens.",
    icon: LockClosedIcon,
  },
  {
    name: "Create Multiple Tokens.",
    description:
      "Whether you're creating a single token or a hundred, we've got you covered.",
    icon: ArrowPathIcon,
  },
  {
    name: "Add Creator Data",
    description:
      "We allow advanced options, like adding your own creator data.",
    icon: FingerPrintIcon,
  },
  {
    name: "Change Existing Tokens",
    description:
      "Created a token with a mistake? No problem, you can change it.",
    icon: Cog6ToothIcon,
  },
  {
    name: "Fast & Efficient",
    description:
      "Our API is built with speed and efficiency in mind, so you can get back to what you do best.",
    icon: BoltIcon,
  },
];
const tiers = [
  {
    name: "Create Token",
    id: "tier-enterprise",
    href: "/solana/create",
    price: "0 SOL",
    description: "Creating a token is free, you only pay for transactions.",
    features: [
      "Token Creation",
      "Image Upload to IPFS",
      "Add Meta Tags",
      "Creator Data",
      "Revoke Freeze Auth",
      "Revoke Mint Auth",
      "Make Immutable",
      "and more...",
    ],
    featured: true,
  },
];
const faqs = [
  {
    question: "What is CoinForge?",
    answer:
      "CoinForge is a platform designed for seamless crypto token management on the Solana blockchain. Users can connect their wallets to access a range of features for managing their crypto assets without the need for an account.",
  },
  {
    question: "How can I get started with CoinForge?",
    answer:
      "To get started with CoinForge, simply connect your wallet to the platform. Once connected, you'll have access to features such as token creation, portfolio tracking, and other token management tools.",
  },
  {
    question: "What services does CoinForge offer?",
    answer:
      "CoinForge offers a range of token management services, including token creation, portfolio tracking, mint authority management, freeze authority management, and making tokens immutable.",
  },
  {
    question: "What is mint authority?",
    answer:
      "Mint authority refers to the ability to create new tokens on the Solana blockchain. With CoinForge, users can manage mint authority for their tokens, controlling the creation process.",
  },
  {
    question: "What is freeze authority?",
    answer:
      "Freeze authority allows users to freeze or unfreeze token accounts, preventing or allowing transfers of tokens. CoinForge enables users to manage freeze authority for their tokens.",
  },
  {
    question: "What is make immutable?",
    answer:
      "Making a token immutable means permanently preventing any changes to its properties, such as supply or decimals. CoinForge allows users to make their tokens immutable for added security and stability.",
  },
  {
    question: "Is CoinForge affordable?",
    answer:
      "Yes, CoinForge offers competitive pricing for its services, ensuring affordability for users of all backgrounds. If you find a similar service at a lower price, please notify us on Telegram.",
  },
  {
    question: "How secure is CoinForge?",
    answer:
      "Security is our top priority at CoinForge. We employ industry-leading security measures to safeguard user assets and data, including encryption, multi-factor authentication, and regular security audits.",
  },
  {
    question: "How can I contact CoinForge?",
    answer:
      "You can reach out to CoinForge via Twitter or Telegram. Follow us on Twitter and join our Telegram group to stay updated and get in touch with our team.",
  },
  // Add more questions as needed
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white">
      <PageHeader
        title="Create Solana Tokens Securely, Fast and Affordable"
        description="Create and manage Solana tokens with ease. CoinForge offers a secure, fast, and affordable solution for managing your Solana crypto assets. Join a community reshaping the future of finance."
      />
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <a href="#">
              <CoinForgeLogo />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 text-white"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href="/solana/dashboard"
              className="px-6 py-2 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-500"
            >
              Open Solana App
            </a>
          </div>
        </nav>
        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full px-6 py-6 overflow-y-auto bg-gray-900 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <CoinForgeLogo />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flow-root mt-6">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="py-6 space-y-2">
                  <a
                    href="/solana/dashboard"
                    className="block px-6 py-2 mb-4 text-sm text-center text-white bg-orange-600 rounded-md hover:bg-orange-500"
                  >
                    Open Solana App
                  </a>
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 -mx-3 text-base font-semibold leading-7 text-gray-200 rounded-lg hover:bg-gray-800"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Open App
                  </a>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative overflow-hidden b-16 bg-gray-950 isolate pt-14 sm:pb-20">
          <img
            src={forgebeam}
            alt=""
            className="absolute inset-0 object-cover w-full h-full opacity-10 -z-10"
          />
          <div
            className="absolute inset-x-0 overflow-hidden -top-40 -z-10 transform-gpu blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="px-6 mx-auto max-w-7xl lg:px-8">
            <div className="max-w-2xl py-32 mx-auto lg:py-36 xl:py-42">
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative px-3 py-1 text-sm leading-6 text-gray-400 rounded-full ring-1 ring-white/10 hover:ring-white/20">
                  Read our blog for info and tutorials{" "}
                  <a href="/solana/blog" className="font-semibold text-white">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Read more <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  Create &amp; Manage Solana Tokens, Secure, Fast and
                  <span className="font-bold"> FREE</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Discover a seamless solution for managing your Solana crypto
                  assets. With intuitive tools and affordability at its core,
                  navigating DeFi has never been easier. Join a community
                  reshaping the future of finance, one accessible step at a
                  time.
                </p>
                <div className="flex items-center justify-center mt-10 gap-x-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Open Solana App
                  </a>
                </div>
              </div>
            </div>

            {/* Logo cloud */}
            <div className="flex items-center justify-center max-w-lg mx-auto my-10 gap-x-8 gap-y-10 sm:max-w-xl lg:max-w-none">
              <img
                className="object-contain w-full max-h-12"
                src={openbookLogo}
                alt="Openbook"
                height={48}
              />
              <img
                className="object-contain w-full max-h-12"
                src={solanaLogo}
                alt="Solana"
                height={48}
              />
              <img
                className="object-contain w-full max-h-12"
                src={ipfsLogo}
                alt="IPFS"
                height={48}
              />
              <img
                className="object-contain w-full max-h-12"
                src={raydiumLogo}
                alt="Raydium"
                height={48}
              />
            </div>
          </div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>

        {/* Feature section */}
        <div className="mt-32 sm:mt-56">
          <div className="px-6 mx-auto max-w-7xl lg:px-8">
            <div className="max-w-2xl mx-auto sm:text-center">
              <h2 className="text-base font-semibold leading-7 text-orange-600">
                Everything you need
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Create Tokens Easily
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Create tokens in 3 easy steps, define their details, define
                their options and then review and deploy.
              </p>
            </div>
          </div>
          <div className="relative pt-16 overflow-hidden">
            <div className="px-6 mx-auto max-w-7xl lg:px-8">
              <img
                src={screenshot}
                alt="App screenshot"
                className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
                width={2432}
                height={1442}
              />
              <div className="relative" aria-hidden="true">
                <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[5%]" />
              </div>
            </div>
          </div>
          <div className="px-6 mx-auto mt-16 max-w-7xl sm:mt-20 md:mt-24 lg:px-8">
            <dl className="grid max-w-2xl grid-cols-1 mx-auto text-base leading-7 text-gray-600 gap-x-6 gap-y-10 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <feature.icon
                      className="absolute w-5 h-5 text-orange-600 left-1 top-1"
                      aria-hidden="true"
                    />
                    {feature.name}
                  </dt>{" "}
                  <dd className="inline">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="relative z-10 pb-20 mt-32 bg-gray-900 sm:mt-56 sm:pb-24 xl:pb-0">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute left-[calc(50%-19rem)] top-[calc(50%-36rem)] transform-gpu blur-3xl">
              <div
                className="aspect-[1097/1023] w-[68.5625rem] bg-gradient-to-r from-[#ff4694] to-[#776fff] opacity-25"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center px-6 mx-auto max-w-7xl gap-x-8 gap-y-10 sm:gap-y-8 lg:px-8 xl:flex-row xl:items-stretch">
            <div className="w-full max-w-2xl -mt-8 xl:-mb-8 xl:w-96 xl:flex-none">
              <div className="relative aspect-[2/1] h-full md:-mx-8 xl:mx-0 xl:aspect-auto">
                <img
                  className="absolute inset-0 object-cover w-full h-full bg-gray-800 shadow-2xl rounded-2xl"
                  src={prospector}
                  alt="Prospector Dev"
                />
              </div>
            </div>
            <div className="w-full max-w-2xl xl:max-w-none xl:flex-auto xl:px-16 xl:py-24">
              <figure className="relative pt-6 isolate sm:pt-12">
                <svg
                  viewBox="0 0 162 128"
                  fill="none"
                  aria-hidden="true"
                  className="absolute top-0 left-0 h-32 -z-10 stroke-white/20"
                >
                  <path
                    id="b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb"
                    d="M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z"
                  />
                  <use href="#b56e9dab-6ccb-4d32-ad02-6b4bb5d9bbeb" x={86} />
                </svg>
                <blockquote className="text-xl font-semibold leading-8 text-white sm:text-2xl sm:leading-9">
                  <p>
                    Our team has worked tirelessly to create an app that can
                    serve crypto lovers, focusing on speed efficiency and
                    security. We're proud of what we've built and are expanding
                    to other major chains like BSC, Ethereum and Base.
                  </p>
                </blockquote>
                <figcaption className="mt-8 text-base">
                  <div className="font-semibold text-white">Prospector</div>
                  <div className="mt-1 text-gray-400">Dev @ CoinForge</div>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* Pricing section */}
        <div className="relative px-6 mt-32 bg-white isolate sm:mt-56 lg:px-8">
          <div
            className="absolute inset-x-0 overflow-hidden -top-3 -z-10 transform-gpu px-36 blur-3xl"
            aria-hidden="true"
          >
            <div
              className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-base font-semibold leading-7 text-orange-600">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Don't overpay for token creation
            </p>
          </div>
          <p className="max-w-2xl mx-auto mt-6 text-lg leading-8 text-center text-gray-600">
            Our token creation fee offers competitive pricing, ensuring
            affordability for our users. If you come across a similar service at
            a lower price, please notify us on socials, we are on telegram,
            twitter and other platforms.
          </p>
          <div className="grid items-center grid-cols-1 mx-auto mt-16 gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-xl">
            {tiers.map((tier, tierIdx) => (
              <div
                key={tier.id}
                className={classNames(
                  tier.featured
                    ? "relative bg-gray-900 shadow-2xl"
                    : "bg-white/60 sm:mx-8 lg:mx-0",
                  tier.featured
                    ? ""
                    : tierIdx === 0
                    ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                    : "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
                  "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
                )}
              >
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.featured ? "text-orange-400" : "text-orange-600",
                    "text-base font-semibold leading-7"
                  )}
                >
                  {tier.name}
                </h3>
                <p className="flex items-baseline mt-4 gap-x-2">
                  <span
                    className={classNames(
                      tier.featured ? "text-white" : "text-gray-900",
                      "text-5xl font-bold tracking-tight"
                    )}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={classNames(
                      tier.featured ? "text-gray-400" : "text-gray-500",
                      "text-base"
                    )}
                  ></span>
                </p>
                <p
                  className={classNames(
                    tier.featured ? "text-gray-300" : "text-gray-600",
                    "mt-6 text-base leading-7"
                  )}
                >
                  {tier.description}
                </p>
                <ul
                  role="list"
                  className={classNames(
                    tier.featured ? "text-gray-300" : "text-gray-600",
                    "mt-8 space-y-3 text-sm leading-6 sm:mt-10"
                  )}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className={classNames(
                          tier.featured ? "text-orange-400" : "text-orange-600",
                          "h-6 w-5 flex-none"
                        )}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={classNames(
                    tier.featured
                      ? "bg-orange-500 text-white shadow-sm hover:bg-orange-400 focus-visible:outline-orange-500"
                      : "text-orange-600 ring-1 ring-inset ring-orange-200 hover:ring-orange-300 focus-visible:outline-orange-600",
                    "mt-8 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
                  )}
                >
                  Create Token
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ section */}
        <div className="px-6 mx-auto mt-32 max-w-7xl sm:mt-56 lg:px-8">
          <div className="max-w-4xl mx-auto divide-y divide-gray-900/10">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              Frequently asked questions
            </h2>
            <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
              {faqs.map((faq) => (
                <Disclosure as="div" key={faq.question} className="pt-6">
                  {({ open }) => (
                    <>
                      <dt>
                        <Disclosure.Button className="flex items-start justify-between w-full text-left text-gray-900">
                          <span className="text-base font-semibold leading-7">
                            {faq.question}
                          </span>
                          <span className="flex items-center ml-6 h-7">
                            {open ? (
                              <MinusSmallIcon
                                className="w-6 h-6"
                                aria-hidden="true"
                              />
                            ) : (
                              <PlusSmallIcon
                                className="w-6 h-6"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </Disclosure.Button>
                      </dt>
                      <Disclosure.Panel as="dd" className="pr-12 mt-2">
                        <p className="text-base leading-7 text-gray-600">
                          {faq.answer}
                        </p>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
            </dl>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="py-10 bg-gray-900 mt-36">
        <Footer />
      </div>
    </div>
  );
}
