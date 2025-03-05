import {
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Command } from 'commander';
import * as bs58 from 'bs58';

const program = new Command();
program
  .requiredOption(
    '--amount <number>',
    'Amount per address to send (in SOL, e.g., "0.1" for 0.1 SOL)'
  )
  .requiredOption(
    '--addresses <string>',
    'Comma-separated list of recipient addresses'
  )
  .requiredOption(
    '--userPublicKey <string>',
    'Public key of the update authority'
  )
  .option(
    '--network <string>',
    'The Solana cluster to use (devnet, testnet, mainnet)',
    'devnet'
  )
  .parse(process.argv);

const options = program.opts();
const payerAccount = new PublicKey(options.userPublicKey);

// Convert the amount (in SOL) to lamports.
const amountLamports = parseFloat(options.amount) * LAMPORTS_PER_SOL;

// Parse the comma-separated list of recipient addresses.
const addresses: string[] = options.addresses.split(',').map((addr: string) => addr.trim());

(async () => {
  try {
    // Create a connection to the specified cluster.
    const connection = new Connection(clusterApiUrl(options.network), 'confirmed');

    // Create a new transaction.
    const tx = new Transaction();
    // For each address, add a transfer instruction.
    addresses.forEach((address) => {
      const recipient = new PublicKey(address);
      const transferIx = SystemProgram.transfer({
        fromPubkey: payerAccount,
        toPubkey: recipient,
        lamports: amountLamports,
      });
      tx.add(transferIx);
    });

    // Set the fee payer and recent blockhash.
    tx.feePayer = payerAccount;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    // Serialize the transaction for frontend signing.
    const serializedTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    const encodedTx = bs58.encode(serializedTx);

    // Output a JSON string so the API can parse it.
    console.log(encodedTx);
  } catch (error) {
    console.error('Error creating multisend transaction:', error);
    process.exit(1);
  }
})();
