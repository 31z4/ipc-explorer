## Compile contracts ABI

1. Clone the repo:

        git clone https://github.com/consensus-shipyard/ipc.git
        cd ipc

2. Checkout the necessary commit. See https://github.com/consensus-shipyard/ipc/blob/cd/contracts/deployments/r314159.json
3. Init required git submodules:

        cd contracts
        git submodule update --init --recursive

4. Compile using Foundry Docker image:

        # Start a shell.
        docker run --rm -it -v $(pwd):/contracts -w /contracts ghcr.io/foundry-rs/foundry sh

        # Install jq.
        apk update
        apk add jq

        # Create an output directory.
        mkdir out

        # Compile.
        forge build -C ./src/ -R $(jq '.remappings | join(",")' remappings.json) --lib-paths lib/ --via-ir --sizes --skip test --out=out

    Note, that this will be very slow on Apple Silicon due to Docker image architecture mismatch.
