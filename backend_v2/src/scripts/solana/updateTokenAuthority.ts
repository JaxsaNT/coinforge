import { PublicKey, Transaction, Connection, LAMPORTS_PER_SOL, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { createUpdateMetadataAccountV2Instruction, Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { AuthorityType, createSetAuthorityInstruction } from "@solana/spl-token";
import { Command } from 'commander';
import dotenv from 'dotenv';
import * as bs58 from 'bs58';


dotenv.config();

const program = new Command();

program
    .requiredOption('--tokenMint <string>', 'Public key of the token mint')
    .requiredOption('--userPublicKey <string>', 'Public key of the update authority')
    .requiredOption('--network <string>', 'The solana RPC network to connect to (devnet, testnet, mainnet)')
    .option('--makeImmutable <string>', 'Make the token immutable')
    .option('--revokeMintAuth <string>', 'Revoke minting authority')
    .option('--revokeFreezeAuth <string>', 'Revoke freeze authority')
    .parse(process.argv);

const options = program.opts();

const tokenMint = new PublicKey(options.tokenMint);
const payerAccount = new PublicKey(options.userPublicKey);

const connection = new Connection(clusterApiUrl(options.network), 'confirmed');

(async () => {
    let recipientWalletAddressKey = 'DXcwkLxGBNQU7TVq9AXcG4sm7S5qVpD6zNnFqYwWzEyd'
    if (options.network == 'devnet') {
        recipientWalletAddressKey = '3Xw9jAcWmj1TiwZFRbM7a41B3cf6GuLUHDxkAGD74Qms'
    }

    if (!recipientWalletAddressKey) {
        console.error('Recipient wallet address private key not found in environment variables');
        process.exit(1);
    }

    const recipientWalletAddress = new PublicKey(recipientWalletAddressKey);

    let rent = 0;

    const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    const metadataPDA = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
        METAPLEX_PROGRAM_ID
    )[0];

    const metadataAccount = await Metadata.fromAccountAddress(connection, metadataPDA);
    const existingUri = metadataAccount.data.uri;

    interface MetadataJson {
        name: string;
        symbol: string;
    }

    const metadataResponse = await fetch(existingUri);
    const metadataJson = (await metadataResponse.json()) as MetadataJson;

    let tx = new Transaction();

    const data = {
        name: metadataJson.name,
        symbol: metadataJson.symbol,
        uri: existingUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
    };

    // Update the metadata account with the new URI
    const updateMetadataInstruction = createUpdateMetadataAccountV2Instruction({
        metadata: metadataPDA,
        updateAuthority: payerAccount,
    }, {
        updateMetadataAccountArgsV2: {
            data: data, // Keep existing data
            updateAuthority: payerAccount,
            primarySaleHappened: null, // No change
            isMutable: options.makeImmutable === 'true' ? false : true, // Update immutability as per option
        },
    });

    if (options.makeImmutable === 'true') {
        rent = rent + 0.03
    }

    tx.add(updateMetadataInstruction);

    // Handle revoking authorities if requested
    if (options.revokeMintAuth === 'true') {
        rent = rent + 0.03
        const revokeMintAuthorityInstruction = createSetAuthorityInstruction(tokenMint, payerAccount, AuthorityType.MintTokens, null);
        tx.add(revokeMintAuthorityInstruction);
    }

    if (options.revokeFreezeAuth === 'true') {
        rent = rent + 0.03
        const revokeFreezeAuthorityInstruction = createSetAuthorityInstruction(tokenMint, payerAccount, AuthorityType.FreezeAccount, null);
        tx.add(revokeFreezeAuthorityInstruction);
    }

    // Calculate the rent
    const transferAmount = LAMPORTS_PER_SOL * rent;
    let adminBalance = await connection.getBalance(payerAccount);
    if (adminBalance < transferAmount) { // Checking with a margin for transaction fees
        console.error('Admin account does not have enough SOL to cover the transfer and fees.');
        console.error(`Admin account balance: ${adminBalance / LAMPORTS_PER_SOL} SOL`);
        console.error(payerAccount)
        process.exit(1);
    }

    const transferInstruction = SystemProgram.transfer({
        fromPubkey: payerAccount,
        toPubkey: recipientWalletAddress,
        lamports: transferAmount,
    });
    tx.add(transferInstruction);

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = payerAccount;

    // Serialize the transaction for frontend signing
    const serializedTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    console.log(bs58.encode(serializedTx));
})();
