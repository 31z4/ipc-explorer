run-proxy:
	mitmdump --mode reverse:$(upstream) --listen-host localhost --listen-port 8545 -s mitmproxy/cors.py

build-ipc-cli-docker:
	docker build -t ipc-cli ipc-cli-docker

ipc-cli-new-wallet:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli wallet new --wallet-type evm

ipc-cli-set-default-wallet:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli wallet set-default --address $(wallet) --wallet-type evm

ipc-cli-create-subnet:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli subnet create \
			--parent /r314159 \
			--min-validator-stake 1 \
			--min-validators 1 \
			--bottomup-check-period 300 \
			--permission-mode collateral \
			--supply-source-kind native

ipc-cli-wallet-pub-key:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli wallet pub-key --wallet-type evm --address $(wallet)

ipc-cli-list-wallets:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli wallet list --wallet-type evm

ipc-cli-wallet-balances:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli wallet balances --subnet $(subnet) --wallet-type evm

ipc-cli-join-subnet:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli subnet join \
			--subnet=$(subnet) \
			--collateral=1 \
			--public-key=$(pubkey) \
			--initial-balance 1

ipc-cli-export-wallet:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli wallet export --address $(wallet) --wallet-type evm --hex > .ipc/validator-1.sk

ipc-cli-fund:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli cross-msg fund --subnet $(subnet) $(amount)

ipc-cli-release:
	docker run -it --rm -v `pwd`/.ipc:/root/.ipc -v ipc-cli-keystore:/root/.ipc-keystore \
		ipc-cli cross-msg release --subnet $(subnet) $(amount)
