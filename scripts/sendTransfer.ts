import { beginCell, toNano, internal as internal_relaxed, Address, SendMode } from '@ton/core';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { NetworkProvider } from '@ton/blueprint';
import { getRandomInt } from '../utils';
import { HighloadQueryId } from '../wrappers/HighloadQueryId';
import { DEFAULT_TIMEOUT, SUBWALLET_ID, maxShift } from '../tests/imports/const';

import { mnemonicToWalletKey } from 'ton-crypto';

export async function run(provider: NetworkProvider) {
    // load mnemonic from .env file
    const mnemonic = process.env.WALLET_MNEMONIC!.split(' ');
    const keypair = await mnemonicToWalletKey(mnemonic);

    const highloadWalletV3 = provider.open(
        HighloadWalletV3.createFromAddress(Address.parse('0QCg05dcxHO09Ydrw-yTuexzMUa8iJmYAO4eWmyqfgVnDZ_0')),
    );

    const rndShift = getRandomInt(0, maxShift);
    const rndBitNum = 1022;

    const testBody = beginCell().storeUint(getRandomInt(0, 1000000), 32).endCell();
    const queryId = HighloadQueryId.fromShiftAndBitNumber(BigInt(rndShift), BigInt(rndBitNum));

    await highloadWalletV3.sendExternalMessage(keypair.secretKey, {
        query_id: queryId,
        message: internal_relaxed({
            to: Address.parse('0QDrRQlKRo5J10a-nUb8UQ7f3ueVYBQVZV9X8uAjmS7gH1Gy'),
            bounce: false,
            value: toNano('0.05'),
            body: testBody,
        }),
        createdAt: Math.floor(Date.now() / 1000) - 10,
        mode: SendMode.PAY_GAS_SEPARATELY,
        subwalletId: SUBWALLET_ID,
        timeout: DEFAULT_TIMEOUT,
    });
}
