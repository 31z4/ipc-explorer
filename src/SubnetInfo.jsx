import { useEffect, useState } from 'react'
import { RootAddressLink } from './RootAddressLink'
import { RootBlockLink } from './RootBlockLink'
import { subnetInfo } from './ipc'

export function SubnetInfo ({ subnet }) {
  const [info, setInfo] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(null)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    subnetInfo(subnet.subnetAddr).then(value => {
      setInfo(value)
      setLoading(false)
    }, (err) => {
      setError(err)
      setLoading(false)
      console.error(err)
    })
  }, [subnet.subnetAddr])

  let content = ''
  let caption = ''
  if (isLoading) {
    caption = (
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--in-progress u-animation--spin"></i>Loading subnet info...
          </span>
        </caption>
    )
  } else if (isError) {
    caption = (
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--warning"></i>Could not load subnet info
          </span>
        </caption>
    )
  } else {
    const contract = info.supplySourceAddr ? <RootAddressLink addr={info.supplySourceAddr} /> : ''
    content = (
        <>
          <tr>
            <th scope='row'>Permission Mode</th>
            <td>{info.permissionMode}</td>
          </tr>
          <tr>
            <th scope='row'>Minimum Validators</th>
            <td>{info.minValidators}</td>
          </tr>
          <tr>
            <th scope='row'>Majority</th>
            <td>{info.majorityPercentage}%</td>
          </tr>
          <tr>
            <th scope='row'>Active Validators Limit</th>
            <td>{info.activeValidatorsLimit}</td>
          </tr>
          <tr>
            <th scope='row'>Bottom-up Check Period</th>
            <td>{info.bottomUpCheckPeriod}</td>
          </tr>
          <tr>
            <th scope='row'>Consensus</th>
            <td>{info.consensus}</td>
          </tr>
          <tr>
            <th scope='row'>Activation Collateral</th>
            <td>{info.minActivationCollateral}</td>
          </tr>
          <tr>
            <th scope='row'>Power Scale</th>
            <td>{info.powerScale}</td>
          </tr>
          <tr>
            <th scope='row'>Supply Source</th>
            <td>{info.supplySourceKind} {contract}</td>
          </tr>
          <tr>
            <th scope='row'>State</th>
            <td>
              <div className={info.state === 'Active' ? 'p-status-label--positive' : 'p-status-label--negative'}>{info.state}</div>
            </td>
          </tr>
        </>
    )
  }

  return (
      <table>
        {caption}
        <tbody>
            <tr>
              <th scope='row'>Contract Address</th>
              <td><RootAddressLink addr={subnet.subnetAddr} /></td>
            </tr>
            <tr>
              <th scope='row'>Created</th>
              <td>{subnet.created_at}</td>
            </tr>
            <tr>
              <th scope='row'>Genesis Block</th>
              <td><RootBlockLink block={subnet.genesis} /></td>
            </tr>
            <tr>
              <th scope='row'>Collateral</th>
              <td>{subnet.collateral}</td>
            </tr>
            <tr>
              <th scope='row'>Circulating Supply</th>
              <td>{subnet.circulatingSupply}</td>
            </tr>
            {content}
        </tbody>
      </table>
  )
}
