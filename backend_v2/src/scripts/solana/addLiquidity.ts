// import { DexInstructions } from "@openbook-dex/openbook";
// import {
//   Connection,
//   clusterApiUrl,
//   PublicKey,
//   Transaction,
// } from "@solana/web3.js";
// import { Command } from "commander";
// import * as bs58 from "bs58";
// import { BN } from "@coral-xyz/anchor";

// const program = new Command();

// program
//   .requiredOption(
//     "--ammId <string>",
//     "Liquidity pool address (AMM ID) to which liquidity is added"
//   )
//   .requiredOption(
//     "--baseAmount <number>",
//     "Amount of base token to add (specified in the smallest unit)"
//   )
//   .requiredOption(
//     "--quoteAmount <number>",
//     "Amount of quote token to add (specified in the smallest unit)"
//   )
//   .requiredOption(
//     "--userPublicKey <string>",
//     "Wallet public key that authorizes the transaction"
//   )
//   .requiredOption(
//     "--network <string>",
//     "The Solana RPC network to connect to (devnet, testnet, mainnet)"
//   )
//   .option(
//     "--minOrderDate <string>",
//     "Optional minimum order date (ISO format). Orders will only be executed after this date."
//   )
//   .parse(process.argv);

// const options = program.opts();

// // Establish a connection to the desired Solana cluster
// const connection = new Connection(clusterApiUrl(options.network), "confirmed");
// const userPublicKey = new PublicKey(options.userPublicKey);

// // Convert the base and quote amounts to BN.
// // (Here we assume the amounts are provided as numbers in the smallest units.)
// const baseAmount = new BN(options.baseAmount);
// const quoteAmount = new BN(options.quoteAmount);

// // Process the optional minimum order date. If provided, parse it to a UNIX timestamp (in seconds) and wrap it in a BN.
// // If not provided, default to zero.
// let minOrderDateBN = new BN(0);
// if (options.minOrderDate) {
//   const date = new Date(options.minOrderDate);
//   if (isNaN(date.getTime())) {
//     console.error("Invalid date format for minOrderDate. Use ISO format, e.g., 2025-01-01T00:00:00Z.");
//     process.exit(1);
//   }
//   const timestampSeconds = Math.floor(date.getTime() / 1000);
//   minOrderDateBN = new BN(timestampSeconds);
// }

// // Create the add liquidity instruction.
// // This assumes your AMM program exposes a helper method like DexInstructions.addLiquidity.
// // Adjust the parameter names/types as required by your implementation.
// const addLiquidityIx = DexInstructions.addLiquidity({
//   ammId: new PublicKey(options.ammId),
//   user: userPublicKey,
//   baseAmount: baseAmount,
//   quoteAmount: quoteAmount,
//   minOrderDate: minOrderDateBN, // if no date is provided, this will be zero.
// });

// (async () => {
//   // Build the transaction and add the liquidity instruction.
//   const tx = new Transaction().add(addLiquidityIx);
//   tx.feePayer = userPublicKey;
//   const { blockhash } = await connection.getLatestBlockhash();
//   tx.recentBlockhash = blockhash;

//   // Serialize the transaction so that the frontend (or wallet adapter) can have the user sign it.
//   // Here we serialize without requiring the signature because the user’s wallet will sign later.
//   const serializedTx = tx.serialize({
//     requireAllSignatures: false,
//     verifySignatures: false,
//   });

//   console.log(bs58.encode(serializedTx));
// })();
