import { Connection, Transaction, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Command } from 'commander';
import * as bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

program
    .requiredOption('--serializedSignedTx <string>', 'Serialized signed transaction')
    .requiredOption('--network <string>', 'The solana RPC network to connect to (devnet, testnet, mainnet)')
    .parse(process.argv);

const options = program.opts();

(async () => {
    try {
        const signedTxBytes = bs58.decode(options.serializedSignedTx);
        const connection = new Connection(clusterApiUrl(options.network), 'confirmed');

        let transaction = Transaction.from(signedTxBytes);
        const sendOptions = { skipPreflight: false, preflightCommitment: 'confirmed' as const };

        // Recreate the transaction with the same instructions, fee payer, etc.
        let newTransaction = new Transaction().add(...transaction.instructions);
        newTransaction.recentBlockhash = transaction.recentBlockhash;
        newTransaction.feePayer = transaction.feePayer;

        transaction.signatures.forEach(({ publicKey, signature }) => {
            if (signature !== null) {
                newTransaction.addSignature(new PublicKey(publicKey), signature);
            } else {
                console.error(`Signature for publicKey ${publicKey.toString()} is null.`);
                // Handle the case where the signature is null, maybe by aborting the operation or logging an error
            }
        });

        let tokenMintPublicKey;
        for (const instruction of transaction.instructions) {
            if (instruction.programId.equals(TOKEN_PROGRAM_ID)) {
                // Assuming the mint instruction format, the mint account should be the first account
                tokenMintPublicKey = instruction.keys[0].pubkey.toString();
                break;
            }
        }

        const signature = await connection.sendRawTransaction(newTransaction.serialize({ requireAllSignatures: false }), sendOptions,);

        const latestBlockHash = await connection.getLatestBlockhash();
        const confirmStrategy = {
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature
        };

        const result = await connection.confirmTransaction(confirmStrategy);
        console.log(tokenMintPublicKey);

    } catch (error) {
        console.error('Failed to send signed transaction:', error);
        process.exit(1); // Exit with error
    }
})().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1); // Exit with error
});
