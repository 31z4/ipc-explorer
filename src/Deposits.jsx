import { useEffect, useState } from 'react'
import { RootAddressLink } from './RootAddressLink'
import { RootMessageLink } from './RootMessageLink'
import { MAX_PROVIDER_BLOCKS, subnetDeposits } from './ipc'

export function Deposits ({ subnetAddr }) {
  const [deposits, setDeposits] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(null)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    subnetDeposits(subnetAddr).then(value => {
      setDeposits(value)
      setLoading(false)
    }, (err) => {
      setError(err)
      setLoading(false)
      console.error(err)
    })
  }, [subnetAddr])

  let caption = ''
  if (isLoading) {
    caption = (
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--in-progress u-animation--spin"></i>Loading deposits...
          </span>
        </caption>
    )
  } else if (isError) {
    caption = (
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--warning"></i>Could not load deposits
          </span>
        </caption>
    )
  } else if (deposits.length === 0) {
    caption = (
        <caption>
          No deposits found
        </caption>
    )
  }

  return (
      <>
        <h3>Deposits</h3>
        <div className="p-notification--information is-inline">
          <div className="p-notification__content">
            <p className="p-notification__message">{`Showing deposits from the last ${MAX_PROVIDER_BLOCKS} blocks due to public RPC provider limitations.`}</p>
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
          {deposits.map(d => (
            <>
              <tr>
                <td><RootMessageLink hash={d.transactionHash} /></td>
                <td><RootAddressLink addrShort={d.rootFrom} addrFull={d.from} /></td>
                <td>{d.to}</td>
                <td>{d.value}</td>
              </tr>
            </>
          ))}
        </tbody>
        </table>
      </>
  )
}
