# Highload Wallet Contract v3

## How to Build

1. Clone the repository:
    ```bash
    git clone https://github.com/ipromise2324/highload-wallet-contract-v3.git
    ```
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Build the project:
    ```bash
    npm run build
    ```

## Run Tests

```bash
npm run test
```

## Deploy Your Own Highload Wallet v3

1. Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2. Edit the `.env` file and fill in your `MNEMONIC`.
3. Once you have filled in the `.env`, you can directly select the `Mnemonic` when running the scripts.

4. Deploy the Highload Wallet:
    ```bash
    npm run start deployHighloadWallet
    ```
5. After deploying the highload-wallet-v3, **record the address**. You will need it for running the send message scripts.

## Send Internal Message

To send an internal message, you can adjust the content of `sendTransfer.ts`. The current code is set up to perform a simple TON transfer.

1. Open `sendTransfer.ts` and modify it as needed for your transaction requirements.

2. Run the script to send the transfer:
    ```bash
    npm run start sendTransfer
    ```

## Send Batch Messages

To send batch messages, you can adjust the content of `sendBatch.ts`. The current code is set up to batch multiple TON transfers.

1. Open `sendBatch.ts` and modify it as needed for your batch transaction requirements.

2. Run the script to send the batch messages:
    ```bash
    npm run start sendBatch
    ```

**Note:** Ensure your highload-wallet-v3 has enough TON to cover the transactions when sending messages.
