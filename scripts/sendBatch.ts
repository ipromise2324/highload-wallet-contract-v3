import { beginCell, toNano, internal as internal_relaxed, Address, SendMode, OutActionSendMsg } from '@ton/core';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { NetworkProvider } from '@ton/blueprint';
import { getRandomInt } from '../utils';
import { HighloadQueryId } from '../wrappers/HighloadQueryId';
import { DEFAULT_TIMEOUT, SUBWALLET_ID, maxShift } from '../tests/imports/const';

import { mnemonicToWalletKey } from 'ton-crypto';
import { promptAddress } from '../utils/ui';

export async function run(provider: NetworkProvider) {
    // Load mnemonic from .env file
    const mnemonic = process.env.WALLET_MNEMONIC!.split(' ');
    const keyPair = await mnemonicToWalletKey(mnemonic);

    const highloadWalletV3Address = await promptAddress('Enter your highload-wallet-v3 address: ', provider.ui());
    const highloadWalletV3 = provider.open(HighloadWalletV3.createFromAddress(highloadWalletV3Address));

    const curQuery = new HighloadQueryId();
    let outMsgs: OutActionSendMsg[] = new Array(254);

    // You can pack your own messages here
    const testBody = beginCell().storeUint(0, 32).storeStringTail('Test highload-wallet-v3').endCell();
    for (let i = 0; i < 2; i++) {
        outMsgs[i] = {
            type: 'sendMsg',
            mode: SendMode.NONE,
            outMsg: internal_relaxed({
                to: Address.parse('0QAHg-2Oy8Mc2BfENEaBcoDNXvHCu7mc28KkPIks8ZVqwmzg'),
                value: toNano('0.01'),
                body: testBody,
            }),
        };
    }

    await highloadWalletV3.sendBatch(
        keyPair.secretKey,
        outMsgs,
        SUBWALLET_ID,
        curQuery,
        DEFAULT_TIMEOUT,
        Math.floor(Date.now() / 1000) - 10,
    );
}
