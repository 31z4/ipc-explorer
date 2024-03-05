import json

from web3 import Web3

HTTP_PROVIDER_URL = "https://api.calibration.node.glif.io/rpc/v1"

GATEWAY_CONTRACT_ADDR = "0xfA6D6c9ccDE5B8a34690F0377F07dbf932b457aC"
REGISTRY_CONTRACT_ADDR = "0x12360EcF961f31d220b5e7E34c05652a68Ec27A0"


def contract(w3: Web3, abi_path: str, contract_addr: str):
    with open(abi_path) as f:
        abi = json.load(f)
    return w3.eth.contract(contract_addr, abi=abi["abi"])


def main():
    w3 = Web3(Web3.HTTPProvider(HTTP_PROVIDER_URL))

    gateway_getter = contract(w3, "abi/GatewayGetterFacet.json", GATEWAY_CONTRACT_ADDR)
    total = gateway_getter.functions.totalSubnets().call()

    print(total)


main()
