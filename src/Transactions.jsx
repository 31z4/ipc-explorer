import { useEffect, useState } from 'react'
import { recentTransactions } from './eth'

export function Transactions ({ providerUrl, setProviderUrl }) {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [isError, setError] = useState(null)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    if (!providerUrl) { return }

    setLoading(true)
    recentTransactions(providerUrl).then(value => {
      setTransactions(value)
      setLoading(false)
    }, (err) => {
      setError(err)
      setLoading(false)
      console.error(err)
    })
  }, [providerUrl])

  let caption = ''
  if (!providerUrl) {
    caption = (
        <caption>
          Not connected to subnet RPC&nbsp;<button onClick={setProviderUrl}>Connect</button>
        </caption>
    )
  } else if (isLoading) {
    caption = (
      <caption>
        <span className="u-has-icon">
          <i className="p-icon--in-progress u-animation--spin"></i>Loading transactions...
        </span>
      </caption>
    )
  } else if (isError) {
    caption = (
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--warning"></i>Could not load transactions
          </span>
        </caption>
    )
  } else if (transactions.length === 0) {
    caption = (
      <caption>
        No transactions found
      </caption>
    )
  }

  return (
      <>
        <h3>Recent Transactions</h3>
        <div className="p-notification--information is-inline">
          <div className="p-notification__content">
            <p className="p-notification__message">{'Showing at most 10 recent transactions due to performance reasons.'}</p>
          </div>
        </div>
        <table>
        <thead>
          <tr>
            <th>Transaction Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Value</th>
          </tr>
        </thead>
        {caption}
        <tbody>
          {transactions.map(w => (
            <>
              <tr>
                <td>{w.transactionHash}</td>
                <td>{w.from}</td>
                <td>{w.to}</td>
                <td>{w.value}</td>
              </tr>
            </>
          ))}
        </tbody>
        </table>
      </>
  )
}
