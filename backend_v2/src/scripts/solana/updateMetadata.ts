import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { createUpdateMetadataAccountV2Instruction, Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { AuthorityType, createSetAuthorityInstruction } from "@solana/spl-token";
import { Command } from 'commander';
import dotenv from 'dotenv';
import axios from 'axios';
import * as bs58 from 'bs58';


dotenv.config();

const program = new Command();

program
    .requiredOption('--tokenMint <string>', 'Public key of the token mint')
    .requiredOption('--userPublicKey <string>', 'Public key of the update authority')
    .option('--tokenName <string>', 'Name of the token')
    .option('--symbol <string>', 'Symbol of the token')
    .option('--logoUri <string>', 'URI for the logo')
    .option('--description <string>', 'Description of the token')
    .option('--twitter <string>', 'twitter url')
    .option('--discord <string>', 'twitter url')
    .option('--telegram <string>', 'twitter url')
    .option('--website <string>', 'twitter url')
    .option('--creatorName <string>', 'creatorName')
    .option('--creatorUrl <string>', 'creatorUrl')
    .option('--tags <string>', 'Comma-separated tags')
    .option('--makeImmutable <string>', 'Make the token immutable')
    .option('--revokeMintAuth <string>', 'Revoke minting authority')
    .option('--revokeFreezeAuth <string>', 'Revoke freeze authority')
    .parse(process.argv);

const options = program.opts();

const PINATA_API_KEY = 'c70bd80c6bcf04e4f192';
const PINATA_SECRET_API_KEY = 'b8d50a0535547392a199a456c8379eccf95c6ca242c7646801b3e19b79ac01bf';

const tokenMint = new PublicKey(options.tokenMint);
const payerAccount = new PublicKey(options.userPublicKey);

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function uploadToIPFS(metadataJson: any): Promise<string> {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const headers = {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
    };

    try {
        const response = await axios.post(url, metadataJson, { headers });
        if (response.status === 200) {
            return `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
        } else {
            throw new Error(`Failed to upload to IPFS: status ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Failed to upload to IPFS: ${error}?`);
    }
}


(async () => {
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
        description?: string;
        decimals?: string;
        image?: string;
        extensions?: {
            twitter?: string;
            discord?: string;
            telegram?: string;
            website?: string;
        };
        tags?: {};
        creator?: {
            name?: string;
            url?: string;
        };
        // Add more fields as needed based on your metadata structure
    }
    const metadataResponse = await fetch(existingUri);
    const metadataJson = (await metadataResponse.json()) as MetadataJson;

    // Update metadataJson with any provided options
    if (options.tokenName) metadataJson.name = options.tokenName;
    if (options.symbol) metadataJson.symbol = options.symbol;
    if (options.description) metadataJson.description = options.description;
    if (options.logoUri) metadataJson.image = `https://ipfs.io/ipfs/${options.logoUri}`;

    metadataJson.extensions = metadataJson.extensions || {};
    if (options.twitter) metadataJson.extensions.twitter = options.twitter;
    if (options.extensions) metadataJson.extensions.discord = options.discord;
    if (options.extensions) metadataJson.extensions.telegram = options.telegram;
    if (options.extensions) metadataJson.extensions.website = options.website;

    metadataJson.creator = metadataJson.creator || {};
    if (options.extensions) metadataJson.creator.name = options.creatorName;
    if (options.extensions) metadataJson.creator.url = options.creatorUrl;

    // Handle tags
    if (options.tags) {
        metadataJson.tags = options.tags.split(',').map((tag: string) => tag.trim());
    }

    // Upload the updated metadata to IPFS and get the new URI
    const newUri = await uploadToIPFS(metadataJson);

    let tx = new Transaction();

    const data = {
        name: metadataJson.name,
        symbol: metadataJson.symbol,
        uri: newUri,
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

    tx.add(updateMetadataInstruction);

    // Handle revoking authorities if requested
    if (options.revokeMintAuth === 'true') {
        const revokeMintAuthorityInstruction = createSetAuthorityInstruction(tokenMint, payerAccount, AuthorityType.MintTokens, null);
        tx.add(revokeMintAuthorityInstruction);
    }

    if (options.revokeFreezeAuth === 'true') {
        const revokeFreezeAuthorityInstruction = createSetAuthorityInstruction(tokenMint, payerAccount, AuthorityType.FreezeAccount, null);
        tx.add(revokeFreezeAuthorityInstruction);
    }

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = payerAccount;

    // Serialize the transaction for frontend signing
    const serializedTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
    console.log(bs58.encode(serializedTx));
})();
