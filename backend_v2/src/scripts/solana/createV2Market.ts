// create_market.js
import { OpenBookV2Client } from "@openbook-dex/openbook-v2";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import dotenv from "dotenv";
import { Command } from "commander";
import * as bs58 from "bs58";
import { AnchorProvider, BN } from "@coral-xyz/anchor";

// You can optionally load environment variables if needed.
dotenv.config();

const program = new Command();

program
  .requiredOption("--marketName <string>", "Name of the market")
  .requiredOption("--baseMint <string>", "Public key of the base asset mint")
  .requiredOption("--quoteMint <string>", "Public key of the quote asset mint")
  .requiredOption("--baseLotSize <number>", "Base lot size", parseInt, 1000000)
  .requiredOption("--quoteLotSize <number>", "Quote lot size", parseInt, 1000)
  .requiredOption(
    "--userPublicKey <string>",
    "Wallet public key to authorize transaction"
  )
  .requiredOption(
    "--network <string>",
    "The Solana RPC network to connect to (devnet, testnet, mainnet)"
  )
  .parse(process.argv);

const options = program.opts();

(async () => {
  const connection = new Connection(clusterApiUrl(options.network), "confirmed");
  const userPublicKey = new PublicKey(options.userPublicKey);

  // Using a dummy wallet since we don't have the user's private key.
  const dummyWallet = {
    publicKey: userPublicKey,
    signTransaction: async () => {
      throw new Error("Cannot sign transactions with dummy wallet");
    },
    signAllTransactions: async () => {
      throw new Error("Cannot sign transactions with dummy wallet");
    },
  };

  const programId = new PublicKey(
    "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb"
  );
  const provider = new AnchorProvider(connection, dummyWallet, {
    commitment: "confirmed",
  });
  const client = new OpenBookV2Client(provider, programId);

  // (You can optionally load the recipient address from env or adjust as needed)
  let recipientWalletAddressKey = "3Xw9jAcWmj1TiwZFRbM7a41B3cf6GuLUHDxkAGD74Qms";
  if (options.network == "devnet") {
    recipientWalletAddressKey = "3Xw9jAcWmj1TiwZFRbM7a41B3cf6GuLUHDxkAGD74Qms";
  }
  if (!recipientWalletAddressKey) {
    console.error(
      "Recipient wallet address private key not found in environment variables"
    );
    process.exit(1);
  }

  const recipientWalletAddress = new PublicKey(recipientWalletAddressKey);
  const transferAmount = LAMPORTS_PER_SOL * 0.3;

  const adminBalance = await connection.getBalance(userPublicKey);
  if (adminBalance < transferAmount) {
    console.error(
      "Admin account does not have enough SOL to cover the transfer and fees."
    );
    process.exit(1);
  }

  // Create a transfer instruction to transfer SOL.
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: userPublicKey,
    toPubkey: recipientWalletAddress,
    lamports: transferAmount,
  });

  const baseMint = new PublicKey(options.baseMint);
  const quoteMint = new PublicKey(options.quoteMint);

  // For simplicity, assume oracles and admin public keys are null.
  const oracleA = null;
  const oracleB = null;
  const openOrdersAdmin = null;
  const consumeEventsAdmin = null;
  const closeMarketAdmin = null;

  const [ixs, signers] = await client.createMarketIx(
    userPublicKey,
    options.marketName,
    quoteMint,
    baseMint,
    new BN(options.quoteLotSize),
    new BN(options.baseLotSize),
    new BN(1000),
    new BN(1000),
    new BN(0), // Time expiry, assuming no expiry
    oracleA,
    oracleB,
    openOrdersAdmin,
    consumeEventsAdmin,
    closeMarketAdmin
  );

  // Create and serialize the transaction.
  const tx = new Transaction().add(...ixs);
  tx.add(transferInstruction);
  tx.feePayer = userPublicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  const serializedTx = tx.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  // Print the serialized transaction to stdout (base58-encoded).
  console.log(bs58.encode(serializedTx));
})();
