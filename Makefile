check:
	ruff check --extend-select I main.py
	ruff format --check main.py

ipc-cli-docker:
	docker build -t ipc-cli docker/ipc-cli

contracts-abi-docker:
	docker build -t contracts-abi --target contracts-abi docker/ipc-cli
