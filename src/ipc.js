import { newDelegatedEthAddress } from '@glif/filecoin-address'
import { ethers, toNumber, toQuantity } from 'ethers'
import humanizeDuration from 'humanize-duration'
import { formatFil } from './utils'

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

export const SUBNET_RPC_PROVIDERS = new Map([
  ['0x30160AFF0EdF3590919b52a07BF17D1F363DA312', 'https://ipc-test.fluence.dev']
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

const SUBNET_ACTOR_ABI = [
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
  )`,
  'function permissionMode() view returns (uint8)',
  'function minValidators() view returns (uint64)',
  'function majorityPercentage() view returns (uint8)',
  'function activeValidatorsLimit() view returns (uint16)',
  'function bottomUpCheckPeriod() view returns (uint256)',
  'function consensus() view returns (uint8)',
  'function killed() view returns (bool)',
  'function minActivationCollateral() view returns (uint256)',
  'function powerScale() view returns (int8)',
  `function supplySource() view returns (
    tuple(
      uint8 kind,
      address tokenAddress,
    )
  )`
]

const SUBNET_PERMISSION_MODE = new Map([
  [0n, 'Collateral'],
  [1n, 'Federated'],
  [2n, 'Static']
])

const SUBNET_CONSENSUS_TYPE = new Map([
  [0n, 'Fendermint']
])

const SUBNET_SUPPLY_KIND = new Map([
  [0n, 'Native'],
  [1n, 'ERC20']
])

const rootGatewayContract = new ethers.Contract(ROOT_GATEWAY_ADDRESS, gatewayAbi, rootProvider)

function filAddr (payload) {
  // I could not find any JS library to deal with FvmAddress payload encoding described here:
  // https://github.com/filecoin-project/ref-fvm/blob/db8c0b12c801f364e87bda6f52d00c6bd0e1b878/shared/src/address/payload.rs#L87
  // So I simply guessed start and end incdices of the ETH address.
  const filAddr = '0x' + payload.slice(322, 322 + 40)
  return newDelegatedEthAddress(filAddr).toString()
}

function formatSubnetId (subnetId) {
  const root = subnetId.root.toString()
  const children = subnetId.route.map(c => newDelegatedEthAddress(c).toString())
  return `/r${root}/${children.join('/')}`
}

function subnetContractAddr (subnetId) {
  return subnetId.route[subnetId.route.length - 1]
}

export async function subnetWithdrawals (subnetAddr) {
  const subnetProvider = SUBNET_RPC_PROVIDERS.get(subnetAddr)
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

export async function subnetDeposits (subnetAddr) {
  const filter = rootGatewayContract.filters.NewTopDownMessage(subnetAddr)
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

function subnetStats (subnets) {
  let totalCollateral = 0n
  let totalSupply = 0n

  for (const s of subnets) {
    totalCollateral += s.stake
    totalSupply += s.circSupply
  }

  return {
    count: subnets.length,
    totalCollateral: formatFil(totalCollateral),
    totalSupply: formatFil(totalSupply)
  }
}

export async function listSubnets () {
  const subnets = await rootGatewayContract.listSubnets()

  const stats = subnetStats(subnets)
  const list = subnets.map(s => {
    return {
      subnetId: formatSubnetId(s.subnetID),
      subnetAddr: subnetContractAddr(s.subnetID),
      collateral: formatFil(s.stake),
      circulatingSupply: formatFil(s.circSupply),
      genesis: s.genesisEpoch
    }
  }).sort((a, b) => b.genesis - a.genesis)

  const now = Date.now()
  const subnetAge = async (subnet) => {
    const block = await rootProvider.send('eth_getBlockByNumber', [toQuantity(subnet.genesis), false])
    const blockTimestamp = block.timestamp * 1000
    const age = now - toNumber(blockTimestamp)

    subnet.age = humanizeDuration(age, { round: true, largest: 1 })
    subnet.created_at = new Date(blockTimestamp).toUTCString()
    subnet.genesis = subnet.genesis.toString()
  }

  const agePromices = list.map(s => subnetAge(s))
  await Promise.all(agePromices)

  return { list, stats }
}

export async function subnetInfo (subnetAddr) {
  const subnetActorContract = new ethers.Contract(subnetAddr, SUBNET_ACTOR_ABI, rootProvider)
  const info = {}

  await Promise.all([
    (async () => {
      info.permissionMode = await subnetActorContract.permissionMode()
    })(),
    (async () => {
      info.minValidators = await subnetActorContract.minValidators()
    })(),
    (async () => {
      info.majorityPercentage = await subnetActorContract.majorityPercentage()
    })(),
    (async () => {
      info.activeValidatorsLimit = await subnetActorContract.activeValidatorsLimit()
    })(),
    (async () => {
      info.bottomUpCheckPeriod = await subnetActorContract.bottomUpCheckPeriod()
    })(),
    (async () => {
      info.consensus = await subnetActorContract.consensus()
    })(),
    (async () => {
      info.killed = await subnetActorContract.killed()
    })(),
    (async () => {
      info.minActivationCollateral = await subnetActorContract.minActivationCollateral()
    })(),
    (async () => {
      info.powerScale = await subnetActorContract.powerScale()
    })(),
    (async () => {
      info.supplySource = await subnetActorContract.supplySource()
    })()
  ])

  return {
    permissionMode: SUBNET_PERMISSION_MODE.get(info.permissionMode),
    minValidators: info.minValidators.toString(),
    majorityPercentage: info.majorityPercentage.toString(),
    activeValidatorsLimit: info.activeValidatorsLimit.toString(),
    bottomUpCheckPeriod: info.bottomUpCheckPeriod.toString(),
    consensus: SUBNET_CONSENSUS_TYPE.get(info.consensus),
    state: info.killed ? 'Killed' : 'Active',
    minActivationCollateral: formatFil(info.minActivationCollateral),
    powerScale: info.powerScale.toString(),
    supplySourceKind: SUBNET_SUPPLY_KIND.get(info.supplySource[0]),
    supplySourceAddr: info.supplySource[1] === '0x0000000000000000000000000000000000000000' ? '' : info.supplySource[1]
  }
}

export async function genesisValidators (subnetAddr) {
  const subnetActorContract = new ethers.Contract(subnetAddr, SUBNET_ACTOR_ABI, rootProvider)

  const validators = await subnetActorContract.genesisValidators()
  const augmentedValidators = []

  const validatorInfo = async (v) => {
    const info = await subnetActorContract.getValidator(v.addr)
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
