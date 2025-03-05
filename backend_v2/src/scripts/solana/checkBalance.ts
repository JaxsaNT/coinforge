import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Command } from 'commander';

const program = new Command();

program.requiredOption('--publicKey <string>', 'The public key of the account to check balance for')
program.requiredOption('--network <string>', 'The solana RPC network to connect to (devnet, testnet, mainnet)');
program.parse(process.argv);

const options = program.opts();
console.log(options.publicKey);
console.log(options.network);
const connection = new Connection(clusterApiUrl(options.network), 'confirmed');
(async () => {
  try {
    const publicKey = new PublicKey(options.publicKey);

    const balance = await connection.getBalance(publicKey);

    // Print the balance (in lamports)
    console.log(options.network);
  } catch (error) {
    console.error("Failed to fetch the balance:", options.network);
    process.exit(1);
  }
})();
