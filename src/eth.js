import { ethers, toQuantity } from 'ethers'
import { formatFil } from './utils'

export async function recentTransactions (providerUrl) {
  const provider = new ethers.JsonRpcProvider(providerUrl)

  const currentBlock = await provider.send('eth_blockNumber')
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
