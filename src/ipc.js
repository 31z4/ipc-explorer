import { ethers } from 'ethers'

const provider = new ethers.JsonRpcProvider('https://api.calibration.node.glif.io/rpc/v1')

export async function listSubnets () {
  const gatewayAddress = '0xfA6D6c9ccDE5B8a34690F0377F07dbf932b457aC'
  const gatewayGetterAbi = [
      `function listSubnets() view returns (
        tuple(
          uint256 stake,
          uint256 genesisEpoch,
          uint256 circSupply,
          uint64 topDownNonce,
          uint64 appliedBottomUpNonce,
          tuple(uint64 root, address[] route) subnetID
        )[]
      )`
  ]
  const gatewayGetterContract = new ethers.Contract(gatewayAddress, gatewayGetterAbi, provider)

  const subnets = await gatewayGetterContract.listSubnets()
  return subnets.map(s => {
    return {
      subnetID: `/r${s.subnetID.root.toString()}/${s.subnetID.route[0]}`,
      collateral: ethers.formatUnits(s.stake) + ' FIL',
      circulatingSupply: ethers.formatUnits(s.circSupply) + ' FIL',
      genesis: s.genesisEpoch.toString()
    }
  })
}

export async function genesisValidators (subnetId) {
  const subnetActorGetterAddress = subnetId.split('/').pop()
  const subnetActorGetterAbi = [
    `function genesisValidators() view returns (
      tuple(
        uint256 weight,
        address addr,
        bytes metadata
      )[]
    )`
  ]
  const subnetActorGetterContract = new ethers.Contract(subnetActorGetterAddress, subnetActorGetterAbi, provider)

  const validators = await subnetActorGetterContract.genesisValidators()
  return validators.map(v => {
    return {
      weight: v.weight.toString(),
      addr: v.addr
    }
  })
}
