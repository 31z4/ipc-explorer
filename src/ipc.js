import { newDelegatedEthAddress } from '@glif/filecoin-address'
import { ethers, toNumber, toQuantity } from 'ethers'
import humanizeDuration from 'humanize-duration'
import { formatFil } from './utils'

// 1500 blocks should work across majority of the public providers.
export const MAX_PROVIDER_BLOCKS = 1500
// const provider = new ethers.JsonRpcProvider('https://api.calibration.node.glif.io/rpc/v1')
// const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/filecoin_testnet')
const rootProvider = new ethers.JsonRpcProvider('https://calibration.filfox.info/rpc/v1')

const ROOT_GATEWAY_ADDRESS = '0x6d25fbFac9e6215E03C687E54F7c74f489949EaF'
const CHILD_GATEWAY_ADDRESS = '0x77aa40b105843728088c0132e43fc44348881da8'

export const SUBNET_RPC_PROVIDERS = new Map([
  // Here can be a map of subnets to their RPC provider URLs.
  // ['SUBNET_CONTRACT_ETH_ADDR', 'RPC_PROVIDER_URL']
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
    'event NewBottomUpMsgBatch(uint256 indexed epoch)',
    `function bottomUpMsgBatch(uint256 epoch) view returns (
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
      )
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
  'function lastBottomUpCheckpointHeight() view returns (uint256)',
  'function consensus() view returns (uint8)',
  'function killed() view returns (bool)',
  'function minActivationCollateral() view returns (uint256)',
  'function powerScale() view returns (int8)',
  `function supplySource() view returns (
    tuple(
      uint8 kind,
      address tokenAddress,
    )
  )`,
  'function isActiveValidator(address validator) view returns (bool)',
  'function isWaitingValidator(address validator) view returns (bool)',
  `function bottomUpCheckpointAtEpoch(uint256 epoch) view returns (
    bool exists,
    tuple(
      tuple(uint64 root, address[] route) subnetId,
      uint256 blockHeight,
      bytes32 blockHash,
      uint64 nextConfigurationNumber,
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
    ) checkpoint
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

const IPC_MSG_KIND = new Map([
  [0n, 'Transfer'],
  [1n, 'Call'],
  [2n, 'Result']
])

const rootGatewayContract = new ethers.Contract(ROOT_GATEWAY_ADDRESS, gatewayAbi, rootProvider)

function filAddr (payload) {
  // I could not find any JS library to deal with FvmAddress payload encoding described here:
  // https://github.com/filecoin-project/ref-fvm/blob/db8c0b12c801f364e87bda6f52d00c6bd0e1b878/shared/src/address/payload.rs#L87
  // So I simply guessed start and end incdices of the ETH address.
  const filAddr = '0x' + payload.slice(322, 322 + 40)
  return newDelegatedEthAddress(filAddr).toString()
}

function ipcAddr (subnetId, payload) {
  return `${formatSubnetId(subnetId)}/${filAddr(payload)}`
}

function formatSubnetIdShort (subnetId) {
  const children = subnetId.route.map(c => newDelegatedEthAddress(c).toString())
  return children.join('/')
}

function formatSubnetId (subnetId) {
  const root = `/r${subnetId.root.toString()}`
  const children = formatSubnetIdShort(subnetId)
  if (children) {
    return `${root}/${children}`
  }
  return root
}

function subnetContractAddr (subnetId) {
  return subnetId.route[subnetId.route.length - 1]
}

export async function subnetWithdrawals (providerUrl) {
  const provider = new ethers.JsonRpcProvider(providerUrl)
  const gatewayContract = new ethers.Contract(CHILD_GATEWAY_ADDRESS, gatewayAbi, provider)
  const filter = gatewayContract.filters.NewBottomUpMsgBatch
  const events = await gatewayContract.queryFilter(filter)

  const batches = []
  const bottomUpMsgBatch = async (epoch) => {
    const b = await gatewayContract.bottomUpMsgBatch(epoch)
    batches.push(b)
  }

  const batchPromices = events.map(e => bottomUpMsgBatch(e.args.epoch))
  await Promise.all(batchPromices)

  const withdrawals = []
  batches.forEach(b => {
    const transfers = b.msgs.filter(m => m.kind === 0n) // `0n` means `Transfer`.
    transfers.forEach(t => {
      withdrawals.push({
        from: ipcAddr(t.from.subnetId, t.from.rawAddress.payload),
        to: ipcAddr(t.to.subnetId, t.to.rawAddress.payload),
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
      rootFrom: filAddr(e.args.message.from.rawAddress.payload),
      from: ipcAddr(e.args.message.from.subnetId, e.args.message.from.rawAddress.payload),
      to: ipcAddr(e.args.message.to.subnetId, e.args.message.to.rawAddress.payload),
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

  // Reliable function to compare bigints.
  // You cannot simply substract b from a because the function must return a Number.
  // But converting a bigint to a Number can throw an exception.
  function compareGenesis (a, b) {
    if (a.genesis > b.genesis) {
      return -1
    } else if (a.genesis < b.genesis) {
      return 1
    }
    return 0
  }

  const list = subnets.map(s => {
    return {
      subnetId: formatSubnetId(s.subnetID),
      subnetIdShort: formatSubnetIdShort(s.subnetID),
      subnetAddr: subnetContractAddr(s.subnetID),
      collateral: formatFil(s.stake),
      circulatingSupply: formatFil(s.circSupply),
      genesis: s.genesisEpoch
    }
  }).sort(compareGenesis)

  const now = Date.now()
  const subnetAge = async (subnet) => {
    const block = await rootProvider.send('eth_getBlockByNumber', [toQuantity(subnet.genesis), false])
    const blockTimestamp = block.timestamp * 1000
    const age = now - toNumber(blockTimestamp)

    subnet.age = humanizeDuration(age, { round: true, largest: 1 })
    subnet.created_at = new Date(blockTimestamp).toUTCString()
    subnet.genesis = subnet.genesis.toString()
  }
  const age = list.map(s => subnetAge(s))

  const lastCheckpoint = async (subnet) => {
    const subnetActorContract = new ethers.Contract(subnet.subnetAddr, SUBNET_ACTOR_ABI, rootProvider)
    const lastBottomUpCheckpointHeight = await subnetActorContract.lastBottomUpCheckpointHeight()
    subnet.lastCheckpoint = lastBottomUpCheckpointHeight.toString()
  }
  const checkpoint = list.map(s => lastCheckpoint(s))

  await Promise.all(age.concat(checkpoint))

  return { list, stats }
}

export async function lastCheckpoint (subnetAddr) {
  const subnetActorContract = new ethers.Contract(subnetAddr, SUBNET_ACTOR_ABI, rootProvider)

  const lastBottomUpCheckpointHeight = await subnetActorContract.lastBottomUpCheckpointHeight()
  if (lastBottomUpCheckpointHeight === 0n) {
    return {
      exists: false,
      msgs: []
    }
  }

  const checkpoint = await subnetActorContract.bottomUpCheckpointAtEpoch(lastBottomUpCheckpointHeight)
  const msgs = checkpoint.checkpoint.msgs.map(m => {
    return {
      kind: IPC_MSG_KIND.get(m.kind),
      from: ipcAddr(m.from.subnetId, m.from.rawAddress.payload),
      to: ipcAddr(m.to.subnetId, m.to.rawAddress.payload),
      value: formatFil(m.value)
    }
  })

  return {
    exists: checkpoint.exists,
    blockHeight: checkpoint.checkpoint.blockHeight.toString(),
    blockHash: checkpoint.checkpoint.blockHash,
    nextConfigurationNumber: checkpoint.checkpoint.nextConfigurationNumber.toString(),
    msgs
  }
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
    bottomUpCheckPeriod: humanizeDuration(toNumber(info.bottomUpCheckPeriod) * 1000),
    consensus: SUBNET_CONSENSUS_TYPE.get(info.consensus),
    state: info.killed ? 'Killed' : 'Active',
    minActivationCollateral: formatFil(info.minActivationCollateral),
    powerScale: info.powerScale.toString(),
    supplySourceKind: SUBNET_SUPPLY_KIND.get(info.supplySource[0]),
    supplySourceAddr: info.supplySource[1] === '0x0000000000000000000000000000000000000000' ? '' : info.supplySource[1]
  }
}

async function validatorInfo (subnetActorContract, addr) {
  const info = await subnetActorContract.getValidator(addr)
  const active = await subnetActorContract.isActiveValidator(addr)
  const waiting = await subnetActorContract.isWaitingValidator(addr)

  let state = 'Unknown'
  if (active) {
    state = 'Active'
  } else if (waiting) {
    state = 'Waiting'
  }

  return {
    addr,
    state,
    confirmedCollateral: formatFil(info[1]),
    totalCollateral: formatFil(info[2])
  }
}

export async function genesisValidators (subnetAddr) {
  const subnetActorContract = new ethers.Contract(subnetAddr, SUBNET_ACTOR_ABI, rootProvider)

  const validators = await subnetActorContract.genesisValidators()
  const augmentedValidators = []

  const validatorInfoFn = async (v) => {
    const info = await validatorInfo(subnetActorContract, v.addr)
    augmentedValidators.push(info)
  }

  const infoPromices = validators.map(v => validatorInfoFn(v))
  await Promise.all(infoPromices)

  return augmentedValidators
}
