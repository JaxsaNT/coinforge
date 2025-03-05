import * as fs from 'fs';
import * as path from 'path';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metaplex } from "@metaplex-foundation/js";

const RPC_ENDPOINT = clusterApiUrl('mainnet-beta');
const RPC_WEBSOCKET_ENDPOINT = 'wss://api.mainnet-beta.solana.com';

const solanaConnection = new Connection(RPC_ENDPOINT, {
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
});

const rayFee = new PublicKey(
    '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'
);
const dataPath = path.join(__dirname, '../../../../data/solana', 'new_solana_tokens.json');

async function monitorNewTokens(connection: Connection) {
    console.log(`monitoring new solana tokens...`);

    try {
        connection.onLogs(
            rayFee,
            async ({ logs, err, signature }) => {
                try {
                    if (err) {
                        console.error(`connection contains error, ${err}`);
                        return;
                    }

                    console.log(`found new token signature: ${signature}`);

                    let signer = '';
                    let baseAddress = '';
                    let baseDecimals = 0;
                    let baseLpAmount = 0;
                    let quoteAddress = '';
                    let quoteDecimals = 0;
                    let quoteLpAmount = 0;

                    /**You need to use a RPC provider for getparsedtransaction to work properly.
                     * Check README.md for suggestions.
                     */
                    const parsedTransaction = await connection.getParsedTransaction(
                        signature,
                        {
                            maxSupportedTransactionVersion: 0,
                            commitment: 'confirmed',
                        }
                    );

                    if (parsedTransaction && parsedTransaction?.meta?.err == null) {
                        console.log(`successfully parsed transaction`);

                        signer =
                            parsedTransaction?.transaction.message.accountKeys[0].pubkey.toString();

                        console.log(`creator, ${signer}`);

                        const postTokenBalances = parsedTransaction?.meta?.postTokenBalances;

                        const baseInfo = postTokenBalances?.find(
                            (balance) =>
                                balance.owner ===
                                '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1' &&
                                balance.mint !== 'So11111111111111111111111111111111111111112'
                        );

                        if (baseInfo) {
                            baseAddress = baseInfo.mint;
                            baseDecimals = baseInfo.uiTokenAmount.decimals;
                            baseLpAmount = baseInfo.uiTokenAmount.uiAmount || 0;
                        }

                        const quoteInfo = postTokenBalances?.find(
                            (balance) =>
                                balance.owner ==
                                '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1' &&
                                balance.mint == 'So11111111111111111111111111111111111111112'
                        );

                        if (quoteInfo) {
                            quoteAddress = quoteInfo.mint;
                            quoteDecimals = quoteInfo.uiTokenAmount.decimals;
                            quoteLpAmount = quoteInfo.uiTokenAmount.uiAmount || 0;
                        }
                    }

                    const metadata = await fetch_metadata(connection, new PublicKey(baseAddress));


                    let tokenName: string | undefined;
                    let tokenLogo: string | undefined;
                    let tokenSymbol: string | undefined;

                    if (typeof metadata === 'object' && 'name' in metadata) {
                        tokenName = metadata.name;
                        tokenLogo = metadata.image;
                        tokenSymbol = metadata.symbol;
                    }


                    const newTokenData = {
                        tokenAddress: baseAddress,
                        timestamp: new Date().toISOString(),
                        name: tokenName,
                        logo: tokenLogo,
                        symbol: tokenSymbol
                    };

                    //store new tokens data in data folder
                    await storeData(dataPath, newTokenData);
                } catch (error) {
                    const errorMessage = `error occured in new solana token log callback function, ${JSON.stringify(error, null, 2)}`;
                    console.log(errorMessage);
                    // Save error logs to a separate file
                    fs.appendFile(
                        'errorNewLpsLogs.txt',
                        `${errorMessage}\n`,
                        function (err) {
                            if (err) console.log('error writing errorlogs.txt', err);
                        }
                    );
                }
            },
            'confirmed'
        );
    } catch (error) {
        const errorMessage = `error occured in new sol lp monitor, ${JSON.stringify(error, null, 2)}`;
        console.log(errorMessage);
        // Save error logs to a separate file
        fs.appendFile('errorNewLpsLogs.txt', `${errorMessage}\n`, function (err) {
            if (err) console.log('error writing errorlogs.txt', err);
        });
    }
}

async function fetch_metadata(connection: Connection, mint_address: PublicKey) {
    try {
        const metaplex = Metaplex.make(connection);

        const data = await metaplex.nfts().findByMint({ mintAddress: mint_address, loadJsonMetadata: true });
        if (!data.json) {
            return {}
        } else {
            return data.json;
        }
    } catch (e) {
        console.log(e);
        return 1;
    }
}

function storeData(dataPath: string, newData: any) {
    fs.readFile(dataPath, (err, fileData) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }
        let json;
        try {
            json = JSON.parse(fileData.toString());
        } catch (parseError) {
            console.error(`Error parsing JSON from file: ${parseError}`);
            return;
        }
        json.push(newData);

        fs.writeFile(dataPath, JSON.stringify(json, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(`Error writing file: ${writeErr}`);
            } else {
                console.log(`New token data stored successfully.`);
            }
        });
    });
}

monitorNewTokens(solanaConnection);