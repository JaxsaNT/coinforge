import { Connection, Keypair, SystemProgram, PublicKey, Transaction, LAMPORTS_PER_SOL, clusterApiUrl
} from '@solana/web3.js';
import { createInitializeMintInstruction, MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { AuthorityType, createMintToInstruction, createSetAuthorityInstruction } from "@solana/spl-token";
import { Command } from 'commander';
import * as bs58 from 'bs58';
import {
  createCreateMetadataAccountV3Instruction,
  DataV2,
} from '@metaplex-foundation/mpl-token-metadata';


const program = new Command();

program
  .requiredOption('--name <string>', 'Token name')
  .requiredOption('--symbol <string>', 'Token symbol')
  .requiredOption('--ipfsHash <string>', 'IPFS hash for the token metadata')
  .requiredOption('--decimals <number>', 'Token decimals', parseInt)
  .requiredOption('--mintAmount <number>', 'Amount of tokens to mint', parseFloat)
  .requiredOption('--userPublicKey <string>', 'payer public key')
  .requiredOption('--mintPublicKey <string>', 'Mint public key')
  .requiredOption('--makeImmutable <string>', 'Make the token immutable')
  .requiredOption('--revokeMintAuth <string>', 'Revoke minting authority')
  .requiredOption('--revokeFreezeAuth <string>', 'Revoke freeze authority')
  .requiredOption('--updateCreator <string>', 'updateCreator')
  .requiredOption('--network <string>', 'The solana RPC network to connect to (devnet, testnet, mainnet)')
  .option('--logo <string>', 'IPFS hash for the token logo') // Optional argument for logo's IPFS hash
  .parse(process.argv);

const options = program.opts();

const makeImmutable = options.makeImmutable === 'true'
const revokeMintAuth = options.revokeMintAuth === 'true';
const revokeFreezeAuth = options.revokeFreezeAuth === 'true';
const updateCreator = options.updateCreator === 'true';

// Include the logo's IPFS hash in the tokenConfig if it's provided
const tokenConfig = {
  name: options.name,
  symbol: options.symbol,
  decimals: options.decimals,
  logo: options.logo ? `https://ipfs.io/ipfs/${options.logo}` : undefined
};
const connection = new Connection(clusterApiUrl(options.network), 'confirmed');
//const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
(async () => {
  const payerAccount = new PublicKey(options.userPublicKey);

  let recipientWalletAddressKey = '3Xw9jAcWmj1TiwZFRbM7a41B3cf6GuLUHDxkAGD74Qms';
  if (options.network == 'devnet') {
    recipientWalletAddressKey = '3Xw9jAcWmj1TiwZFRbM7a41B3cf6GuLUHDxkAGD74Qms'
  }

  if (!recipientWalletAddressKey) {
    console.error('Recipient wallet address private key not found in environment variables');
    process.exit(1);
  }

  const recipientWalletAddress = new PublicKey(recipientWalletAddressKey);

  // Calculate the amount to transfer (0.1 SOL in this example)
  let rent = 0;
  if (makeImmutable) {
    rent = rent + 0.03
  }
  if (revokeMintAuth) {
    rent = rent + 0.03
  }
  if (revokeFreezeAuth) {
    rent = rent + 0.03
  }
  if (updateCreator) {
    rent = rent + 0.5
  }
  const transferAmount = LAMPORTS_PER_SOL * rent;

  let adminBalance = await connection.getBalance(payerAccount);

  if (adminBalance < transferAmount) { // Checking with a margin for transaction fees
    console.error('Admin account does not have enough SOL to cover the transfer and fees.');
    console.error(`Admin account balance: ${adminBalance / LAMPORTS_PER_SOL} SOL`);
    console.error(payerAccount)
    // Handle error, perhaps by exiting the script or reducing the transfer amount
    process.exit(1);
  }
  const mintKeypair = Keypair.generate();
  const tx = new Transaction();
  const lamportsForRentExemption = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  if (rent > 0) {
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: payerAccount,
      toPubkey: recipientWalletAddress,
      lamports: transferAmount,
    });

    tx.add(transferInstruction);
  }
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payerAccount,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: lamportsForRentExemption,
      programId: (await import('@solana/spl-token')).TOKEN_PROGRAM_ID
    })
  );

  tx.add(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      tokenConfig.decimals,
      payerAccount, // mint authority
      payerAccount, // freeze authority (optional; can be null)
      (await import('@solana/spl-token')).TOKEN_PROGRAM_ID
    )
  );
  const ata = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    payerAccount
  );

  tx.add(
    createAssociatedTokenAccountInstruction(
      payerAccount, // payer
      ata,             // associated token account
      payerAccount, // owner
      mintKeypair.publicKey // mint
    )
  );

  tx.add(
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      payerAccount, // mint authority
      options.mintAmount,
      [],
      (await import('@solana/spl-token')).TOKEN_PROGRAM_ID
    )
  );
  const [metadataPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    PROGRAM_ID
  );
  const encodedMetadataUri = `https://ipfs.io/ipfs/${options.ipfsHash}`;

  // Data for metadata – note that the metadata URI should point to a JSON file following the Metaplex standard
  const metadataData: DataV2 = {
    name: tokenConfig.name,
    symbol: tokenConfig.symbol,
    uri: encodedMetadataUri || 'https://example.com/placeholder.json',
    sellerFeeBasisPoints: 0, // set to 0 as this is not an NFT royalty scenario
    creators: null,
    collection: null,
    uses: null
  };

  tx.add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mintKeypair.publicKey,
        mintAuthority: payerAccount,
        payer: payerAccount,
        updateAuthority: payerAccount,

      },
      {
        createMetadataAccountArgsV3: {
          data: metadataData,
          isMutable: true,
          collectionDetails: null,
        },
      }
    )
  );

  if (revokeMintAuth) {
    const revokeMintAuthorityInstruction = createSetAuthorityInstruction(
      mintKeypair.publicKey,
      payerAccount,
      AuthorityType.MintTokens,
      null
    );
    tx.add(revokeMintAuthorityInstruction)
  }

  if (revokeFreezeAuth) {
    const revokeFreezeAuthorityInstruction = createSetAuthorityInstruction(
      mintKeypair.publicKey,
      payerAccount,
      AuthorityType.FreezeAccount,
      null
    );
    tx.add(revokeFreezeAuthorityInstruction)
  }
  // const createMintAccountInstruction = SystemProgram.createAccount({
  //   fromPubkey: payerAccount,
  //   newAccountPubkey: mintPublicKey,
  //   space: MINT_SIZE,
  //   lamports: lamportsForRentExemption,
  //   programId: TOKEN_PROGRAM_ID,
  // });

  // const initializeMintInstruction = createInitializeMint2Instruction(
  //   mintPublicKey, tokenConfig.decimals, payerAccount, payerAccount,
  // );

  // const [metadataAccount] = PublicKey.findProgramAddressSync(
  //   [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), mintPublicKey.toBuffer()],
  //   METADATA_PROGRAM_ID,
  // );


  // const createMetadataInstruction = createCreateMetadataAccountV3Instruction({
  //   metadata: metadataAccount,
  //   mint: mintPublicKey,
  //   mintAuthority: payerAccount,
  //   payer: payerAccount,
  //   updateAuthority: payerAccount,
  // }, {
  //   createMetadataAccountArgsV3: {
  //     data: {
  //       name: tokenConfig.name,
  //       symbol: tokenConfig.symbol,
  //       uri: encodedMetadataUri,
  //       sellerFeeBasisPoints: 0,
  //       creators: null,
  //       collection: null,
  //       uses: null,
  //     },
  //     isMutable: true,
  //     collectionDetails: null,
  //   },
  // });

  // // Derive the associated token account address
  // const associatedTokenAddress = await getAssociatedTokenAddress(
  //   mintPublicKey, // Mint
  //   payerAccount // Owner
  // );

  // // Create the associated token account instruction
  // const associatedTokenAccountInstruction = createAssociatedTokenAccountInstruction(
  //   payerAccount, // Payer of the transaction fees
  //   associatedTokenAddress, // Address of the associated token account
  //   payerAccount, // Owner of the associated token account
  //   mintPublicKey // Token mint address
  // );


  // tx.add(
  //   createMintAccountInstruction,
  //   initializeMintInstruction,
  //   createMetadataInstruction,
  //   associatedTokenAccountInstruction
  // );


  // const mintInstruction = createMintToInstruction(
  //   mintPublicKey,
  //   associatedTokenAddress,
  //   payerAccount,
  //   options.mintAmount
  // )
  //tx.add(mintInstruction);

  // if (makeImmutable) {
  //   const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  //   // Use findProgramAddressSync to find the Metadata PDA
  //   const [metadataPDA] = PublicKey.findProgramAddressSync(
  //     [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mintPublicKey.toBuffer()],
  //     METAPLEX_PROGRAM_ID
  //   );

  //   const makeMetadataImmutableInstruction = createUpdateMetadataAccountV2Instruction(
  //     {
  //       metadata: metadataPDA,
  //       updateAuthority: payerAccount,
  //     },
  //     {
  //       updateMetadataAccountArgsV2: {
  //         data: null,
  //         updateAuthority: payerAccount,
  //         primarySaleHappened: null,
  //         isMutable: false,
  //       },
  //     }
  //   );
  //   tx.add(makeMetadataImmutableInstruction);
  // }

  // if (revokeMintAuth) {
  //   const revokeMintAuthorityInstruction = createSetAuthorityInstruction(
  //     mintPublicKey,
  //     payerAccount,
  //     AuthorityType.MintTokens,
  //     null
  //   );
  //   tx.add(revokeMintAuthorityInstruction)
  // }

  // if (revokeFreezeAuth) {
  //   const revokeFreezeAuthorityInstruction = createSetAuthorityInstruction(
  //     mintPublicKey,
  //     payerAccount,
  //     AuthorityType.FreezeAccount,
  //     null
  //   );
  //   tx.add(revokeFreezeAuthorityInstruction)
  // }

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  tx.feePayer = payerAccount;


  const serializedTx = tx.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
  console.log(bs58.encode(serializedTx));
})();
