import { DexInstructions, Market, TokenInstructions } from "@openbook-dex/openbook";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Command, OptionValues } from 'commander';
import * as bs58 from 'bs58';
import { BN } from "@coral-xyz/anchor";
const program = new Command();

program
    .requiredOption('--baseMint <string>', 'Public key of the base asset mint')
    .requiredOption('--baseMintDecimals <int>', 'Decimal places of the base asset mint')
    .requiredOption('--quoteMint <string>', 'Public key of the quote asset mint')
    .requiredOption('--lotSize <int>', 'Lot size for the base asset, specified in the smallest unit')
    .requiredOption('--tickSize <int>', 'Tick size for price increments, specified in the smallest unit')
    .requiredOption('--userPublicKey <string>', 'Wallet public key to authorize transaction')
    .requiredOption('--network <string>', 'The Solana RPC network to connect to (devnet, testnet, mainnet)')
    .requiredOption('--eventQueueLength <number>', 'Event queue length', parseInt)
    .requiredOption('--requestQueueLength <number>', 'Request queue length', parseInt)
    .requiredOption('--orderbookLength <number>', 'Orderbook length', parseInt)
    .parse(process.argv);

const options = program.opts();
const connection = new Connection(clusterApiUrl(options.network), 'confirmed');
const userPublicKey = new PublicKey(options.userPublicKey);

const baseLotSize = Math.round(10 ** options.baseMintDecimals * parseFloat(options.lotSize));
const quoteLotSize = Math.round(
    parseFloat(options.lotSize) *
    10 ** options.baseMintDecimals *
    parseFloat(options.tickSize),
);
const market = Keypair.generate();
const requestQueue = Keypair.generate();
const eventQueue = Keypair.generate();
const bids = Keypair.generate();
const asks = Keypair.generate();
const baseVault = Keypair.generate();
const quoteVault = Keypair.generate();
const feeRateBps = 0;
const quoteDustThreshold = new BN(100);

(async () => {
    const tx = new Transaction()

    // Add our fees
    const siteFeeInstruction = await siteFeeTransaction(options, connection, userPublicKey);
    tx.add(siteFeeInstruction);

    // Create the market transaction
    const [tx1, tx2] = await listMarket({
        connection,
        baseMint: new PublicKey(options.baseMint),
        quoteMint: new PublicKey(options.quoteMint),
        baseLotSize: baseLotSize,
        quoteLotSize: quoteLotSize,
        dexProgramId: options.network == 'devnet' ? new PublicKey('EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj') : new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
        eventQueueLength: parseInt(options.eventQueueLength),
        requestQueueLength: parseInt(options.requestQueueLength),
        orderbookLength: parseInt(options.orderbookLength),
    });

    tx.add(tx1);

    tx.feePayer = userPublicKey;
    tx2.feePayer = userPublicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx2.recentBlockhash = blockhash;

    tx.partialSign(baseVault, quoteVault);
    tx2.partialSign(market, requestQueue, eventQueue, bids, asks);


    const serializedTx = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
    });
    const serializedTx1 = tx2.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
    });

    const encodedTx = bs58.encode(serializedTx);
    const encodedTx1 = bs58.encode(serializedTx1);

    console.log(JSON.stringify({
        transaction1: encodedTx,
        transaction2: encodedTx1,
        marketId: market.publicKey.toBase58(),
    }));

})();


async function listMarket({
    connection,
    baseMint,
    quoteMint,
    baseLotSize,
    quoteLotSize,
    dexProgramId,
    priorityFee = undefined,
    computeUnits = undefined,
    eventQueueLength = 128,
    requestQueueLength = 63,
    orderbookLength = 201,
}: {
    connection: Connection;
    baseMint: PublicKey;
    quoteMint: PublicKey;
    baseLotSize: number;
    quoteLotSize: number;
    dexProgramId: PublicKey;
    priorityFee?: number;
    computeUnits?: number;
    eventQueueLength?: number;
    requestQueueLength?: number;
    orderbookLength?: number;
}) {
    function getVaultOwnerAndNonce() {
        const vaultSignerNonce = new BN(0)
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                const vaultOwner = PublicKey.createProgramAddressSync(
                    [market.publicKey.toBuffer(), vaultSignerNonce.toArrayLike(Buffer, 'le', 8)],
                    dexProgramId,
                )
                return { vaultOwner, vaultSignerNonce }
            } catch (e) {
                vaultSignerNonce.iaddn(1)
                if (vaultSignerNonce.gt(new BN(25555))) throw Error('find vault owner error')
            }
        }
    }
    const { vaultOwner, vaultSignerNonce } = getVaultOwnerAndNonce()
    const minimumLamports = await connection.getMinimumBalanceForRentExemption(165)
    const tx1 = new Transaction();
    tx1.add(
        SystemProgram.createAccount({
            fromPubkey: userPublicKey,
            newAccountPubkey: baseVault.publicKey,
            lamports: minimumLamports,
            space: 165,
            programId: TokenInstructions.TOKEN_PROGRAM_ID,
        }),
        SystemProgram.createAccount({
            fromPubkey: userPublicKey,
            newAccountPubkey: quoteVault.publicKey,
            lamports: minimumLamports,
            space: 165,
            programId: TokenInstructions.TOKEN_PROGRAM_ID,
        }),
        TokenInstructions.initializeAccount({
            account: baseVault.publicKey,
            mint: baseMint,
            owner: vaultOwner,
        }),
        TokenInstructions.initializeAccount({
            account: quoteVault.publicKey,
            mint: quoteMint,
            owner: vaultOwner,
        }),
    );

    const tx2 = new Transaction();
    tx2.add(
        SystemProgram.createAccount({
            fromPubkey: userPublicKey,
            newAccountPubkey: market.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
                Market.getLayout(dexProgramId).span,
            ),
            space: Market.getLayout(dexProgramId).span,
            programId: dexProgramId,
        }),
        SystemProgram.createAccount({
            fromPubkey: userPublicKey,
            newAccountPubkey: requestQueue.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
                calculateRequestQueueSize(requestQueueLength),
            ),
            space: calculateRequestQueueSize(requestQueueLength),
            programId: dexProgramId,
        }),
        SystemProgram.createAccount({
            fromPubkey: userPublicKey,
            newAccountPubkey: eventQueue.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
                calculateEventQueueSize(eventQueueLength),
            ),
            space: calculateEventQueueSize(eventQueueLength),
            programId: dexProgramId,
        }),
        SystemProgram.createAccount({
            fromPubkey: userPublicKey,
            newAccountPubkey: bids.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
                calculateOrderbookSize(orderbookLength),
            ),
            space: calculateOrderbookSize(orderbookLength),
            programId: dexProgramId,
        }),
        SystemProgram.createAccount({
            fromPubkey: userPublicKey,
            newAccountPubkey: asks.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
                calculateOrderbookSize(orderbookLength),
            ),
            space: calculateOrderbookSize(orderbookLength),
            programId: dexProgramId,
        }),
        DexInstructions.initializeMarket({
            market: market.publicKey,
            requestQueue: requestQueue.publicKey,
            eventQueue: eventQueue.publicKey,
            bids: bids.publicKey,
            asks: asks.publicKey,
            baseVault: baseVault.publicKey,
            quoteVault: quoteVault.publicKey,
            baseMint,
            quoteMint,
            baseLotSize: new BN(baseLotSize),
            quoteLotSize: new BN(quoteLotSize),
            feeRateBps,
            vaultSignerNonce,
            quoteDustThreshold,
            programId: dexProgramId,
            authority: undefined,
        }),
    );


    return [tx1, tx2];
}

const REQUEST_QUEUE_ITEM_SIZE = 88;
const EVENT_QUEUE_ITEM_SIZE = 80;
const ORDERBOOK_ITEM_SIZE = 72;
const QUEUE_HEADER_SIZE = 44;
const ORDERBOOK_HEADER_SIZE = 52;

function calculateRequestQueueSize(requestQueueLength: number): number {
    return requestQueueLength * REQUEST_QUEUE_ITEM_SIZE + QUEUE_HEADER_SIZE;
}

function calculateOrderbookSize(orderbookLength: number): number {
    return orderbookLength * ORDERBOOK_ITEM_SIZE + ORDERBOOK_HEADER_SIZE;
}

function calculateEventQueueSize(eventQueueSize: number): number {
    return eventQueueSize * EVENT_QUEUE_ITEM_SIZE + QUEUE_HEADER_SIZE;
}

async function siteFeeTransaction(options: OptionValues, connection: Connection, userPublicKey: PublicKey) {
    let recipientWalletAddressKey = '3Xw9jAcWmj1TiwZFRbM7a41B3cf6GuLUHDxkAGD74Qms';
    if (options.network === 'devnet') {
        recipientWalletAddressKey = '3Xw9jAcWmj1TiwZFRbM7a41B3cf6GuLUHDxkAGD74Qms';
    }

    if (!recipientWalletAddressKey) {
        console.error('Recipient wallet address key not found.');
        process.exit(1);
    }

    const recipientWalletAddress = new PublicKey(recipientWalletAddressKey);
    const transferAmount = LAMPORTS_PER_SOL * 0.3;

    let adminBalance = await connection.getBalance(userPublicKey);

    if (adminBalance < transferAmount) {
        console.error('Admin account does not have enough SOL to cover the transfer and fees.');
        process.exit(1);
    }

    const transferInstruction = SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: recipientWalletAddress,
        lamports: transferAmount
    });

    return transferInstruction;
}
