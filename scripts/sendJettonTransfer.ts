import { beginCell, toNano, internal as internal_relaxed, Address, SendMode } from '@ton/core';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { NetworkProvider } from '@ton/blueprint';
import { getRandomInt } from '../utils';
import { HighloadQueryId } from '../wrappers/HighloadQueryId';
import { DEFAULT_TIMEOUT, SUBWALLET_ID, maxShift } from '../tests/imports/const';

import { mnemonicToWalletKey } from 'ton-crypto';
import { promptAddress, promptAmount } from '../utils/ui';
import { JettonWallet } from '../wrappers/JettonWallet';
import { JettonMinter } from '../wrappers/JettonMinter';

export async function run(provider: NetworkProvider) {
    // Load mnemonic from .env file
    const mnemonic = process.env.WALLET_MNEMONIC!.split(' ');
    const keyPair = await mnemonicToWalletKey(mnemonic);

    const highloadWalletV3Address = await promptAddress('Enter your highload-wallet-v3 address: ', provider.ui());
    const highloadWalletV3 = provider.open(HighloadWalletV3.createFromAddress(highloadWalletV3Address));

    const rndShift = getRandomInt(0, maxShift);
    const rndBitNum = getRandomInt(0, 1022);
    const queryId = HighloadQueryId.fromShiftAndBitNumber(BigInt(rndShift), BigInt(rndBitNum));

    // You can pack your own messages here
    const jettonMasterAddress = await promptAddress('Enter your jetton-master address: ', provider.ui());
    const jettonMaster = provider.open(JettonMinter.createFromAddress(jettonMasterAddress));
    const hwJettonWalletAddress = await jettonMaster.getWalletAddress(highloadWalletV3Address);
    const hwJettonWallet = provider.open(JettonWallet.createFromAddress(hwJettonWalletAddress));
    const decimals = 9;
    const hwBalance = await hwJettonWallet.getJettonBalance();
    const to = await promptAddress('Enter your destination address: ', provider.ui());
    const responseAddress = to;
    const jettonAmount = await promptAmount(`Enter the amount of Jetton to transfer (max: ${Number(hwBalance) / 10**decimals}): `, decimals, provider.ui()); // prettier-ignore
    const transferBody = JettonWallet.transferMessage(
        jettonAmount,
        to,
        responseAddress,
        null,
        0n,
        beginCell().storeUint(0, 32).endCell(),
    );

    console.log('The message transmission will take some time. Please be patient and wait.');
    console.log('Sending msg...');
    while (true) {
        try {
            await highloadWalletV3.sendExternalMessage(keyPair.secretKey, {
                query_id: queryId,
                message: internal_relaxed({
                    to: hwJettonWalletAddress,
                    bounce: false,
                    value: toNano('0.1'),
                    body: transferBody,
                }),
                createdAt: Math.floor(Date.now() / 1000) - 10,
                mode: SendMode.PAY_GAS_SEPARATELY,
                subwalletId: SUBWALLET_ID,
                timeout: DEFAULT_TIMEOUT,
            });
            console.log('Success');
            break;
        } catch (e) {
            // console.log(e);
            // Sleep for 1 second
            // await new Promise((resolve) => setTimeout(resolve, 300));
        }
    }
}
