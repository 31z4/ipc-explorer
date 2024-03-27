import { ethers, toQuantity } from 'ethers'
import { MAX_PROVIDER_BLOCKS } from './ipc'
import { formatFil } from './utils'

// Due to performance reasons this functions return up to 10 transactions
// from the most recent MAX_PROVIDER_BLOCKS blocks.
export async function recentTransactions (providerUrl) {
  const provider = new ethers.JsonRpcProvider(providerUrl)

  const currentBlock = await provider.send('eth_blockNumber')
  const transactions = []

  for (let n = currentBlock; n > currentBlock - MAX_PROVIDER_BLOCKS; n--) {
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
    if (transactions.length >= 10) { break }
  }

  return transactions
}
