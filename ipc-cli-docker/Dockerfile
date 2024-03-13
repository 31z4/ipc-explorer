FROM rust:1.76.0-bookworm AS build

# Install tools required for contracts ABI compilation.
RUN set -eux; \
    # Install jq.
    apt-get update; \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --no-install-recommends \
        jq; \
    rm -rf /var/lib/apt/lists/*; \
    \
    # Build and install forge.
    cargo install --git https://github.com/foundry-rs/foundry --profile local --locked forge

# Clone the repo and checkout specific commit.
# See https://github.com/consensus-shipyard/ipc/blob/cd/contracts/deployments/r314159.json
RUN set -eux; \
    git clone https://github.com/consensus-shipyard/ipc.git; \
    cd /ipc; \
    git checkout 048c5815075f611e22eec0137453d8ca5d0846ff

# Final build.
RUN set -eux; \
    # Compile contracts ABI.
    cd /ipc/contracts; \
    make compile-abi; \
    \
    # Build ipc-cli.
    cd /ipc/ipc/cli; \
    cargo build --release --locked

# Our binary is not statically linked so we cannot use 'scratch'.
FROM debian:bookworm-slim AS ipc-cli

COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /ipc/target/release/ipc-cli /bin/ipc-cli

ENTRYPOINT ["/bin/ipc-cli"]
