import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Metaplex } from '@metaplex-foundation/js';
import { Command } from 'commander';
import { TOKEN_PROGRAM_ID, MintLayout, AccountLayout } from "@solana/spl-token";

const program = new Command();
program.requiredOption('--publicKey <string>', 'The public key of the account to check for token ownership');
program.requiredOption('--network <string>', 'The solana RPC network to connect to (devnet, testnet, mainnet)');
program.parse(process.argv);

const options = program.opts();
const connection = new Connection(clusterApiUrl(options.network), 'confirmed');

(async () => {
    const publicKey = new PublicKey(options.publicKey);
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
    const tokens = [];

    for (const { account, pubkey } of tokenAccounts.value) {
        const accountData = AccountLayout.decode(account.data);
        const mintAddress = accountData.mint;

        const mintAccountInfo = await connection.getAccountInfo(new PublicKey(mintAddress));
        if (!mintAccountInfo) return;
        const mintInfo = MintLayout.decode(mintAccountInfo.data);

        // Determine if the user has mint and/or freeze authority
        const hasMintAuthority = !(mintInfo.mintAuthorityOption === 1 &&
            mintInfo.mintAuthority &&
            mintInfo.mintAuthority.equals(publicKey));

        // Check if the freeze authority is enabled and matches the user's public key
        const hasFreezeAuthority = !(mintInfo.freezeAuthorityOption === 1 &&
            mintInfo.freezeAuthority &&
            mintInfo.freezeAuthority.equals(publicKey));

        const metaplex = Metaplex.make(connection);
        const metadataPDA = metaplex.nfts().pdas().metadata({ mint: (new PublicKey(mintAddress)) });

        try {
            const metadataAccount = await Metadata.fromAccountAddress(connection, metadataPDA);
            const metadataUri = metadataAccount.data.uri;
            const metadataResponse = await fetch(metadataUri);
            const metadataJson = await metadataResponse.json();

            let hasIsImmutable = false;
            if (hasMintAuthority) {
                hasIsImmutable = true;
            } else if (metadataAccount.isMutable) {
                hasIsImmutable = false;
            }

            tokens.push({
                address: accountData.mint.toBase58(),
                decimals: mintInfo.decimals,
                name: metadataJson.name ? metadataJson.name : '',
                symbol: metadataJson.symbol ? metadataJson.symbol : '',
                description: metadataJson.description ? metadataJson.description : '',
                logo: metadataJson.image ? metadataJson.image : '',
                twitter: metadataJson.extensions?.twitter ? metadataJson.extensions.twitter : '',
                discord: metadataJson.extensions?.discord ? metadataJson.extensions.discord : '',
                telegram: metadataJson.extensions?.telegram ? metadataJson.extensions.telegram : '',
                website: metadataJson.extensions?.website ? metadataJson.extensions.website : '',
                creatorName: metadataJson.creator?.name ?? '',
                creatorUrl: metadataJson.creator?.url ?? '',
                tags: metadataJson.tags && Array.isArray(metadataJson.tags) ? metadataJson.tags : [],
                revokeMintAuthority: hasMintAuthority,
                revokeFreezeAuthority: hasFreezeAuthority,
                revokeMutable: hasIsImmutable
            });
        } catch (error) {
            console.error(`Failed to fetch metadata for mint address ${mintAddress}:`, error);
        }
    }

    console.log(JSON.stringify(tokens, null, 2));
})();