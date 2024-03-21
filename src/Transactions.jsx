import { useEffect, useState } from 'react'
import { recentTransactions } from './eth'

export function Transactions ({ providerUrl, setProviderUrl }) {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setLoading] = useState(false)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    if (!providerUrl) { return }

    setLoading(true)
    recentTransactions(providerUrl).then(value => {
      setTransactions(value)
      setLoading(false)
    })
  }, [providerUrl])

  let content
  if (isLoading) {
    content = <p>Loading transactions...</p>
  } else if (!providerUrl) {
    content = (
        <>
          Not connected to subnet RPC
          <button onClick={setProviderUrl}>Connect</button>
        </>
    )
  } else if (transactions.length === 0) {
    content = <p>No transactions found</p>
  } else if (transactions.length > 0) {
    content = (
        <table>
        <thead>
          <tr>
            <th>Transaction Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <>
              <tr>
                <td>{t.transactionHash}</td>
                <td>{t.from}</td>
                <td>{t.to}</td>
                <td>{t.value}</td>
              </tr>
            </>
          ))}
        </tbody>
        </table>
    )
  }

  return (
      <>
        <h3>Recent Transactions</h3>
        {content}
      </>
  )
}
