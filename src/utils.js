import { ethers } from 'ethers'

export function subnetAddr (subnetId) {
  return subnetId.split('/').pop()
}

export function formatFil (value) {
  return `${ethers.formatUnits(value)} FIL`
}
