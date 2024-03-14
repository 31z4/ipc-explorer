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
gateway_addr = "0xfA6D6c9ccDE5B8a34690F0377F07dbf932b457aC"
registry_addr = "0x12360EcF961f31d220b5e7E34c05652a68Ec27A0"

# As seen on #ipc-dev channel of Filecoin Slack.
[[subnets]]
id = "/r314159/t410fgalav7yo342zbem3kkqhx4l5d43d3iyswlpwkby"

[subnets.config]
network_type = "fevm"
provider_http = "https://ipc-test.fluence.dev"
gateway_addr = "0x77aa40b105843728088c0132e43fc44348881da8"
registry_addr = "0x74539671a1d2f1c8f200826baba665179f53a1b7"
EOF
```

Make sure that `gateway_addr` and `registry_addr` of the root net `/r314159` match the most recent values published at [this link](https://github.com/consensus-shipyard/ipc/blob/cd/contracts/deployments/r314159.json).

Also, note the non-default `keystore_path`.
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

Since we don't have a running validator node we'll use Fluence test subnet.
Note that it may not be available in the future.

```sh
subnet=/r314159/t410fgalav7yo342zbem3kkqhx4l5d43d3iyswlpwkby amount=0.01 make ipc-cli-fund
```
