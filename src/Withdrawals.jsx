import { useEffect, useState } from 'react'
import { subnetWithdrawals } from './ipc'

export function Withdrawals ({ providerUrl, setProviderUrl }) {
  const [withdrawals, setWithdrawals] = useState([])
  const [isLoading, setLoading] = useState(false)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    if (!providerUrl) { return }

    setLoading(true)
    subnetWithdrawals(providerUrl).then(value => {
      setWithdrawals(value)
      setLoading(false)
    })
  }, [providerUrl])

  let content
  if (isLoading) {
    content = <p>Loading withdrawals...</p>
  } else if (!providerUrl) {
    content = (
        <>
          Not connected to subnet RPC
          <button onClick={setProviderUrl}>Connect</button>
        </>
    )
  } else if (withdrawals.length === 0) {
    content = <p>No withdrawals found</p>
  } else if (withdrawals.length > 0) {
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
    )
  }

  return (
      <>
        <h3>Withdrawals</h3>
        {content}
      </>
  )
}
