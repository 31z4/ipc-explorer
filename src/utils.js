import { ethers } from 'ethers'

export function formatFil (value) {
  return `${ethers.formatUnits(value)} FIL`
}
