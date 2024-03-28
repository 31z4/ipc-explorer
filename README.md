# IPC Explorer

The goal of this project is to build a minimum viable product (MVP) of the IPC explorer.

> InterPlanetary Consensus (IPC) is a revolutionary blockchain technology that powers planetary-scale web3 apps.

You can learn more about this technology at [https://www.ipc.space](https://www.ipc.space).

Using IPC Explorer you can:

- [x] Browse subnets.
- [x] View subnet configuration.
- [x] View the last committed bottom-up checkpoint of a subnet.
- [x] View subnet genesis validators.
- [x] View recent subnet deposits.
- [x] View recent subnet withdrawals.
- [x] View recent subnet transactions.

Check out IPC Explorer [website](https://ipcexplorer.com) or run the application [locally](#running-locally).

## How it's made

- To narrow the scope of the MVP the decision was made to not build an indexing backend at this stage.
- The application relies on [public Filecoin RPC providers](https://docs.filecoin.io/networks/calibration/rpcs).
- IPC Explorer is a single page application (SPA) built using [React](https://react.dev).
- The application uses [ethers.js](https://ethers.org) to:
  - Call various methods of the IPC Subnet Actor (ISA) and the IPC Gateway Actor (IGA) smart contracts to collect various information about subnets.
  - Fetch blocks, transactions, and events from the root network and its child subnets.

## Known issues and limitations

- **Listing subnet withdrawals may not work.**
  It relies on the `NewBottomUpMsgBatch` event of the IPC Gateway Actor smart contract.
  But for some reason, I do not observe such events via a local subnet RPC during manual testing.
- **Connecting to a subnet RPC provider is subject to [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)**.
  Therefore, you can only connect to a local subnet RPC provider from a [locally running application](#running-locally).
  Connecting to a public subnet RPC provider is possible if the provider explicitly allows it by setting corresponding [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) headers.

## Development

### Running locally

First, clone the repository and `cd` into its directory:

```sh
git clone git@github.com:31z4/ipc-explorer.git
cd ipc-explorer
```

Now, simply run the following commands to install all required packages and run a development server:

```sh
npm install
npm run dev
```

The application is running at [http://localhost:5173](http://localhost:5173).

#### Connecting to a local subnet RPC

You can only connect to a local subnet RPC from a locally running application due to [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). You also need a workaround because [Fendermint Ethereum API Facade](https://github.com/consensus-shipyard/ipc/tree/fbe598d0d2f908a3bddbcd4e7d3e5a31cd3a26d9/fendermint/eth/api) doesn't set CORS headers that would allow such connection from your browser.

The suggested workaround is to run a reverse proxy that sets required CORS headers.
In the following instruction, it's assumed that you're already running a subnet with Ethereum API Facade listening on `http://localhost:8545`. This should be the case if you followed [the official instruction](https://docs.ipc.space/quickstarts/deploy-a-subnet) about deploying a subnet.

1. Install [mitmproxy](https://mitmproxy.org).
2. Run it with a custom [cors.py](mitmproxy/cors.py) module:

```sh
mitmdump --mode reverse:http://localhost:8545 --listen-host localhost --listen-port 9545 -s mitmproxy/cors.py
```

Now you should be able to connect to subnet RPC from the locally running application. Note the non-standard provider URL (which is our reverse proxy) that you must enter after you click on the "Connect" button in the application:

```
http://localhost:9545
```

### Manual testing using ipc-cli

The following is a simplified and limited version of [the official documentation](https://docs.ipc.space/quickstarts/deploy-a-subnet) about deploying a subnet.
If you need a fully operational subnet follow the official instructions instead.

1. First, you need to build a Docker image for `ipc-cli`:

```sh
make build-ipc-cli-docker
```

2. Initialize your `ipc-cli` config:

```sh
mkdir .ipc

cat << EOF > .ipc/config.toml
keystore_path = "~/.ipc-keystore"

[[subnets]]
id = "/r314159"

[subnets.config]
network_type = "fevm"
provider_http = "https://api.calibration.node.glif.io/rpc/v1"
gateway_addr = "`curl -s https://raw.githubusercontent.com/consensus-shipyard/ipc/cd/contracts/deployments/r314159.json | jq -r '.gateway_addr'`"
registry_addr = "`curl -s https://raw.githubusercontent.com/consensus-shipyard/ipc/cd/contracts/deployments/r314159.json | jq -r '.registry_addr'`"
EOF
```

Note the non-default `keystore_path`.
This is the path where a Docker volume will be mounted to persist wallet keys for the `ipc-cli` container.

3. Set up a new wallet.

```sh
make ipc-cli-new-wallet
```

Make note of the address of the wallet you created.
And set it as your default wallet:

```sh
wallet=NEW_WALLET_ADDRESS make ipc-cli-set-default-wallet
```

4. Go to the [Calibration faucet](https://faucet.calibnet.chainsafe-fil.io/) and get some funds sent to this new wallet.

#### Create a child subnet

```sh
make ipc-cli-create-subnet
```

Make a note of the address of the subnet you created.

#### Join the subnet from your validator (i.e., the wallet you created earlier)

First, get the public key of your wallet and note it down:

```sh
wallet=NEW_WALLET_ADDRESS make ipc-cli-wallet-pub-key
```

Now, join the subnet:

```sh
subnet=NEW_SUBNET_ID pubkey=NEW_WALLET_PUBKEY make ipc-cli-join-subnet
```

#### Deposit funds

```sh
subnet=NEW_SUBNET_ID amount=0.01 make ipc-cli-fund
```

#### Withdraw funds

Withdrawing funds requires a running subnet.
