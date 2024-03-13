import { ethers, toQuantity } from 'ethers'
import { SUBNET_RPC_PROVIDERS } from './ipc'
import { formatFil, subnetAddr } from './utils'

export async function recentTransactions (subnetId) {
  const subnetProvider = SUBNET_RPC_PROVIDERS.get(subnetAddr(subnetId))
  if (!subnetProvider) { return undefined }

  const provider = new ethers.JsonRpcProvider(subnetProvider)

  // const currentBlock = await provider.send('eth_blockNumber')
  // Most recent blocks on Fluence IPC subnet don't have any transactions.
  // So we just hardcode a block with transactions for demo purpose.
  const currentBlock = 35193
  const transactions = []

  for (let n = currentBlock; n > currentBlock - 10; n--) {
    const block = await provider.send('eth_getBlockByNumber', [toQuantity(n), true])
    const blockTransactions = block.transactions.map(t => {
      return {
        transactionHash: t.hash,
        from: t.from,
        to: t.to,
        value: formatFil(t.value)
      }
    })
    transactions.push(...blockTransactions)
  }

  return transactions
}
