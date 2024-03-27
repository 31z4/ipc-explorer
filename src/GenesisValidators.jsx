import { useEffect, useState } from 'react'
import { HeaderWithTooltip } from './HeaderWithTooltip'
import { RootAddressLink } from './RootAddressLink'
import { genesisValidators } from './ipc'

export function GenesisValidators ({ subnetAddr }) {
  const [validators, setValidators] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(null)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    genesisValidators(subnetAddr).then(value => {
      setValidators(value)
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
            <i className="p-icon--in-progress u-animation--spin"></i>Loading validators...
          </span>
        </caption>
    )
  } else if (isError) {
    caption = (
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--warning"></i>Could not load validators
          </span>
        </caption>
    )
  } else if (validators.length === 0) {
    caption = (
        <caption>
          No validators found
        </caption>
    )
  }

  return (
      <>
        <h3>Genesis Validators</h3>
        <table>
        <thead>
          <tr>
            <th style={{ width: '50%' }}>Address</th>
            <HeaderWithTooltip
              header="Confirmed Collateral"
              headerScope="col"
              tooltip="The amount of collateral actually confirmed in the subnet"
              tooltipPosition="top-right"
            />
            <HeaderWithTooltip
              header="Total Collateral"
              headerScope="col"
              tooltip="Aside from confirmed, there is also the collateral has been supplied, but not yet confirmed in the subnet"
              tooltipPosition="top-right"
            />
            <th>State</th>
          </tr>
        </thead>
        {caption}
        <tbody>
          {validators.map(v => {
            let stateClass = 'p-status-label'
            if (v.state === 'Active') {
              stateClass = 'p-status-label--positive'
            } else if (v.state === 'Waiting') {
              stateClass = 'p-status-label--information'
            }
            return (
              <>
                <tr>
                  <td><RootAddressLink addr={v.addr} /></td>
                  <td>{v.confirmedCollateral}</td>
                  <td>{v.totalCollateral}</td>
                  <td><div className={stateClass}>{v.state}</div></td>
                </tr>
              </>
            )
          })}
        </tbody>
        </table>
      </>
  )
}
