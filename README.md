# IPC Explorer

The goal of this project is to build an MVP of the IPC explorer.
As a user of the explorer I want to:

- [x] Browse subnets.
    - [x] Subnet ID
    - [x] Collateral
    - [x] Circulating supply
    - [x] Genesis
    - [x] Subnet age
- [x] List subnet genesis validators.
- [x] List recent subnet deposits.
- [x] List recent subnet withdrawals.
- [ ] List subnet checkpoints.
- [x] List recent subnet transactions.

## Development

### Manual testing using ipc-cli

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
This is the path where a Docker volume will be mounted to persist wallet keys for `ipc-cli` container.

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
