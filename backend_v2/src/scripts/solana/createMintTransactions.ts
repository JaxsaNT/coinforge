import { PublicKey, Transaction, Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { AuthorityType, createMintToInstruction, createSetAuthorityInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { createUpdateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import dotenv from 'dotenv';
import { Command } from 'commander';
import * as bs58 from 'bs58';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .requiredOption('--mintAmount <number>', 'Amount of tokens to mint', parseFloat)
  .requiredOption('--tokenMint <string>', 'Public key of the mint')
  .requiredOption('--userPublicKey <string>', 'payer public key')
  .requiredOption('--makeImmutable <string>', 'Make the token immutable')
  .requiredOption('--revokeMintAuth <string>', 'Revoke minting authority')
  .requiredOption('--revokeFreezeAuth <string>', 'Revoke freeze authority')
  .requiredOption('--network <string>', 'The solana RPC network to connect to (devnet, testnet, mainnet)')
  .parse(process.argv);

const options = program.opts();

const makeImmutable = options.makeImmutable === 'true'
const revokeMintAuth = options.revokeMintAuth === 'true';
const revokeFreezeAuth = options.revokeFreezeAuth === 'true';

const connection = new Connection(clusterApiUrl(options.network), 'confirmed');

const mintAmount = options.mintAmount;
const tokenMint = new PublicKey(options.userPublicKey);
const payerAccount = new PublicKey(options.userPublicKey);

(async () => {
  const mintKeypair = Keypair.generate();
  if (mintAmount < 0) {
    console.error('Mint ammount less than 0')
  }

  const associatedTokenAddress = await getAssociatedTokenAddress(
    tokenMint,
    payerAccount
  );

  let tx = new Transaction()

  const mintInstruction = createMintToInstruction(
    tokenMint,
    associatedTokenAddress,
    payerAccount,
    mintAmount
  )
  tx.add(mintInstruction);

  if (makeImmutable) {
    const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    // Use findProgramAddressSync to find the Metadata PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
      METAPLEX_PROGRAM_ID
    );

    const makeMetadataImmutableInstruction = createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: payerAccount,
      },
      {
        updateMetadataAccountArgsV2: {
          data: null,
          updateAuthority: payerAccount,
          primarySaleHappened: null,
          isMutable: false,
        },
      }
    );
    tx.add(makeMetadataImmutableInstruction);
  }

  if (revokeMintAuth) {
    const revokeMintAuthorityInstruction = createSetAuthorityInstruction(
      tokenMint,
      payerAccount,
      AuthorityType.MintTokens,
      null
    );
    tx.add(revokeMintAuthorityInstruction)
  }

  if (revokeFreezeAuth) {
    const revokeFreezeAuthorityInstruction = createSetAuthorityInstruction(
      tokenMint,
      payerAccount,
      AuthorityType.FreezeAccount,
      null
    );
    tx.add(revokeFreezeAuthorityInstruction)
  }

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payerAccount;

  const serializedTx = tx.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
  console.log(bs58.encode(serializedTx));
})();
