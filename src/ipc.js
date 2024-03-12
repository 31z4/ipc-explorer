import { newDelegatedEthAddress } from '@glif/filecoin-address'
import { ethers } from 'ethers'

// Gives latest 1998 blocks max.
// const MAX_PROVIDER_BLOCKS = 1998
// const provider = new ethers.JsonRpcProvider('https://api.calibration.node.glif.io/rpc/v1')

// Gives latest 2879 blocks max.
// const MAX_PROVIDER_BLOCKS = 2879
// const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/filecoin_testnet')

// Gives latest 2879 blocks max.
const MAX_PROVIDER_BLOCKS = 2879
const rootProvider = new ethers.JsonRpcProvider('https://calibration.filfox.info/rpc/v1')

const ROOT_GATEWAY_ADDRESS = '0xfA6D6c9ccDE5B8a34690F0377F07dbf932b457aC'
const CHILD_GATEWAY_ADDRESS = '0x77aa40b105843728088c0132e43fc44348881da8'

const SUBNET_RPC_PROVIDERS = new Map([
  ['0x10367c17c45602E2a33b46d2D08F0C3dC0FA2C62', 'https://ipc-test.fluence.dev']
])

const gatewayAbi = [
    `function listSubnets() view returns (
      tuple(
        uint256 stake,
        uint256 genesisEpoch,
        uint256 circSupply,
        uint64 topDownNonce,
        uint64 appliedBottomUpNonce,
        tuple(uint64 root, address[] route) subnetID
      )[]
    )`,
    `event NewTopDownMessage(
      address indexed subnet,
      tuple(
        uint8 kind,
        tuple (
          tuple(uint64 root, address[] route) subnetId,
          tuple(uint8 addrType, bytes payload) rawAddress,
        ) to,
        tuple (
          tuple(uint64 root, address[] route) subnetId,
          tuple(uint8 addrType, bytes payload) rawAddress,
        ) from,
        uint64 nonce,
        uint256 value,
        bytes message
      ) message
    )`,
    `event NewBottomUpMsgBatch(
      uint256 indexed epoch,
      tuple(
        tuple(uint64 root, address[] route) subnetId,
        uint256 blockHeight,
        tuple(
          uint8 kind,
          tuple (
            tuple(uint64 root, address[] route) subnetId,
            tuple(uint8 addrType, bytes payload) rawAddress,
          ) to,
          tuple (
            tuple(uint64 root, address[] route) subnetId,
            tuple(uint8 addrType, bytes payload) rawAddress,
          ) from,
          uint64 nonce,
          uint256 value,
          bytes message
        )[] msgs
      ) batch
    )`
]

const rootGatewayContract = new ethers.Contract(ROOT_GATEWAY_ADDRESS, gatewayAbi, rootProvider)

function formatFil (value) {
  return `${ethers.formatUnits(value)} FIL`
}

function subnetAddr (subnetId) {
  return subnetId.split('/').pop()
}

function filAddr (payload) {
  // I could not find any JS library to deal with FvmAddress payload encoding described here:
  // https://github.com/filecoin-project/ref-fvm/blob/db8c0b12c801f364e87bda6f52d00c6bd0e1b878/shared/src/address/payload.rs#L87
  // So I simply guessed start and end incdices of the ETH address.
  const filAddr = '0x' + payload.slice(322, 322 + 40)
  return newDelegatedEthAddress(filAddr).toString()
}

export async function subnetWithdrawals (subnetId) {
  const subnetProvider = SUBNET_RPC_PROVIDERS.get(subnetAddr(subnetId))
  if (!subnetProvider) { return undefined }

  const provider = new ethers.JsonRpcProvider(subnetProvider)
  const gatewayContract = new ethers.Contract(CHILD_GATEWAY_ADDRESS, gatewayAbi, provider)
  const filter = gatewayContract.filters.NewBottomUpMsgBatch
  const events = await gatewayContract.queryFilter(filter)

  const withdrawals = []
  events.forEach(e => {
    const transfers = e.args.batch.msgs.filter(m => m.kind === 0n) // `0n` means `Transfer`.
    transfers.forEach(t => {
      withdrawals.push({
        transactionHash: e.transactionHash,
        from: filAddr(t.from.rawAddress.payload),
        to: filAddr(t.to.rawAddress.payload),
        value: formatFil(t.value)
      })
    })
  })

  return withdrawals
}

export async function subnetDeposits (subnetId) {
  console.log(await subnetWithdrawals(subnetAddr(subnetId)))

  const filter = rootGatewayContract.filters.NewTopDownMessage(subnetAddr(subnetId))
  const events = await rootGatewayContract.queryFilter(filter, -MAX_PROVIDER_BLOCKS)
  const deposits = events.filter(e => e.args.message.kind === 0n) // `0n` means `Transfer`.
  return deposits.map(e => {
    return {
      transactionHash: e.transactionHash,
      from: filAddr(e.args.message.from.rawAddress.payload),
      to: filAddr(e.args.message.to.rawAddress.payload),
      value: formatFil(e.args.message.value)
    }
  })
}

export async function listSubnets () {
  const subnets = await rootGatewayContract.listSubnets()
  return subnets.map(s => {
    return {
      subnetID: `/r${s.subnetID.root.toString()}/${s.subnetID.route[0]}`,
      collateral: formatFil(s.stake),
      circulatingSupply: formatFil(s.circSupply),
      genesis: s.genesisEpoch.toString()
    }
  })
}

export async function genesisValidators (subnetId) {
  const subnetActorGetterAbi = [
    `function genesisValidators() view returns (
      tuple(
        uint256 weight,
        address addr,
        bytes metadata
      )[]
    )`,
    `function getValidator(address validatorAddress) view returns (
      tuple(
        uint256 federatedPower,
        uint256 confirmedCollateral,
        uint256 totalCollateral,
        bytes metadata
      )
    )`
  ]
  const subnetActorGetterContract = new ethers.Contract(subnetAddr(subnetId), subnetActorGetterAbi, rootProvider)

  const validators = await subnetActorGetterContract.genesisValidators()
  const augmentedValidators = []

  const validatorInfo = async (v) => {
    const info = await subnetActorGetterContract.getValidator(v.addr)
    augmentedValidators.push({
      addr: v.addr,
      federatedPower: info[0].toString(),
      confirmedCollateral: formatFil(info[1]),
      totalCollateral: formatFil(info[2])
    })
  }

  const infoPromices = validators.map(v => validatorInfo(v))
  await Promise.all(infoPromices)

  return augmentedValidators
}
