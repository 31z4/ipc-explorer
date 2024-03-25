import { useEffect, useState } from 'react'
import { subnetWithdrawals } from './ipc'

export function Withdrawals ({ providerUrl, setProviderUrl }) {
  const [withdrawals, setWithdrawals] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [isError, setError] = useState(null)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    if (!providerUrl) { return }

    setLoading(true)
    subnetWithdrawals(providerUrl).then(value => {
      setWithdrawals(value)
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
          Not connected to subnet RPC <button onClick={setProviderUrl}>Connect</button>
        </caption>
    )
  } else if (isLoading) {
    caption = (
      <caption>
        <span className="u-has-icon">
          <i className="p-icon--in-progress u-animation--spin"></i>Loading withdrawals...
        </span>
      </caption>
    )
  } else if (isError) {
    caption = (
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--warning"></i>Could not load withdrawals
          </span>
        </caption>
    )
  } else if (withdrawals.length === 0) {
    caption = (
      <caption>
        No withdrawals found
      </caption>
    )
  }

  return (
      <>
        <h3>Withdrawals</h3>
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
          {withdrawals.map(w => (
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
