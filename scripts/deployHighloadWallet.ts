import { beginCell, toNano } from '@ton/core';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { compile, NetworkProvider } from '@ton/blueprint';
import { mnemonicToWalletKey } from 'ton-crypto';
import { DEFAULT_TIMEOUT, SUBWALLET_ID } from '../tests/imports/const';
import dotenv from 'dotenv';

dotenv.config();

export async function run(provider: NetworkProvider) {
    const mnemonic = process.env.WALLET_MNEMONIC!.split(' ');
    const keyPair = await mnemonicToWalletKey(mnemonic);

    const highloadWalletV3 = provider.open(
        HighloadWalletV3.createFromConfig(
            {
                publicKey: keyPair.publicKey,
                subwalletId: SUBWALLET_ID,
                timeout: DEFAULT_TIMEOUT,
            },
            await compile('HighloadWalletV3'),
        ),
    );

    await highloadWalletV3.sendDeploy(provider.sender(), toNano('1'));
    await provider.waitForDeploy(highloadWalletV3.address, 10, 5);

    const chalk = require('chalk');
    console.log('\n====================================================================================');
    console.log(chalk.red('Your HighloadWalletV3 Address: '), chalk.yellow(highloadWalletV3.address));
    console.log('====================================================================================\n');
}
