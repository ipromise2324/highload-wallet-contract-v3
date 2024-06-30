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

    const rndShift = getRandomInt(0, maxShift);
    const rndBitNum = getRandomInt(0, 1022);
    const queryId = HighloadQueryId.fromShiftAndBitNumber(BigInt(rndShift), BigInt(rndBitNum));

    const msgCount = 2;
    let outMsgs: OutActionSendMsg[] = new Array(msgCount);

    // You can pack your own messages here
    const testBody = beginCell().storeUint(0, 32).storeStringTail('Test highload-wallet-v3').endCell();
    for (let i = 0; i < msgCount; i++) {
        outMsgs[i] = {
            type: 'sendMsg',
            mode: SendMode.NONE,
            outMsg: internal_relaxed({
                to: Address.parse('UQChc1fIWCxkvP58259wiX9qLjCn0c2ZwCO9cVmL3EkZi0MN'),
                value: toNano('0.05'),
                body: testBody,
            }),
        };
    }

    let tryCount = 0;
    console.log('The message transmission will take some time. Please be patient and wait.');
    console.log('Sending batch...');
    while (true) {
        tryCount++;
        try {
            await highloadWalletV3.sendBatch(
                keyPair.secretKey,
                outMsgs,
                SUBWALLET_ID,
                queryId,
                DEFAULT_TIMEOUT,
                Math.floor(Date.now() / 1000) - 10,
            );
            console.log('Success at try:', tryCount);
            break;
        } catch (e) {
            // console.log(e);
            // Sleep for 1 second
            // await new Promise((resolve) => setTimeout(resolve, 300));
        }
    }
}
