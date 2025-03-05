import CoinForgeStats from "../components/CoinForgeStats";
import CtaGroups from "../components/CtaGroup";
import Footer from "../components/Footer";
import ListUserTokens from "../components/ListUserTokens";
import PageHeader from "../components/PageHeader";
import RecentTokensSlider from "../components/RecentTokensSlider";
import Banner from "../components/Banner";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Manage Your Solana Tokens with Ease - CoinForge Dashboard"
        description="Manage your Solana tokens easily with CoinForge's Dashboard. Enjoy a fast, secure, and user-friendly interface designed to streamline your token operations. Track, analyze, and optimize your assets for an effective blockchain strategy."
      />
      <Sidebar />
      <Banner />
      <main className="px-4 py-12 lg:pl-72">
        <div className="w-full mx-auto mb-12 sm:px-6 lg:px-8 lg:w-10/12 xl:w-10/12">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-red-600">
              Dashboard
            </h1>
          </div>
          <p className="mb-4 text-center">
            We take pride in helping thousands of cryptocurrency enthusiasts
            create and manage their tokens.
          </p>
          <CoinForgeStats />
          <CtaGroups />
          <ListUserTokens />
          <hr className="my-16 border-gray-800" />
          <RecentTokensSlider />
          <hr className="my-16 border-gray-800" />
        </div>
        <Footer />
      </main>
    </>
  );
}
