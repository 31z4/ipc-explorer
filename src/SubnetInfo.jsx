import { useEffect, useState } from 'react'
import { HeaderWithTooltip } from './HeaderWithTooltip'
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
            <HeaderWithTooltip
              header="Permission Mode"
              headerScope="row"
              tooltip="Permission mode for validators"
              tooltipPosition="top-left"
            />
            <td>{info.permissionMode}</td>
          </tr>
          <tr>
            <HeaderWithTooltip
              header="Minimum Validators"
              headerScope="row"
              tooltip="Minimum validators number needed to activate the subnet"
              tooltipPosition="top-left"
            />
            <td>{info.minValidators}</td>
          </tr>
          <tr>
            <HeaderWithTooltip
              header="Majority"
              headerScope="row"
              tooltip="Majority percentage required for consensus"
              tooltipPosition="top-left"
            />
            <td>{info.majorityPercentage}%</td>
          </tr>
          <tr>
            <HeaderWithTooltip
              header="Active Validators Limit"
              headerScope="row"
              tooltip="Limit on the number of active validators"
              tooltipPosition="top-left"
            />
            <td>{info.activeValidatorsLimit}</td>
          </tr>
          <tr>
            <HeaderWithTooltip
              header="Bottom-up Check Period"
              headerScope="row"
              tooltip="Period for bottom-up checkpointing operations"
              tooltipPosition="top-left"
            />
            <td>{info.bottomUpCheckPeriod}</td>
          </tr>
          <tr>
            <HeaderWithTooltip
              header="Consensus"
              headerScope="row"
              tooltip="Consensus protocol type used in the subnet"
              tooltipPosition="top-left"
            />
            <td>{info.consensus}</td>
          </tr>
          <tr>
            <HeaderWithTooltip
              header="Activation Collateral"
              headerScope="row"
              tooltip="Minimum collateral required for subnet activation"
              tooltipPosition="top-left"
            />
            <td>{info.minActivationCollateral}</td>
          </tr>
          <tr>
            <HeaderWithTooltip
              header="Power Scale"
              headerScope="row"
              tooltip="Power scale determining the accuracy of the power scale (in number of decimals from whole FIL)"
              tooltipPosition="top-left"
            />
            <td>{info.powerScale}</td>
          </tr>
          <tr>
            <HeaderWithTooltip
              header="Supply Source"
              headerScope="row"
              tooltip="Supply strategy for the subnet"
              tooltipPosition="top-left"
            />
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
              <td><RootAddressLink addrShort={subnet.subnetAddr} addrFull={subnet.subnetAddr} /></td>
            </tr>
            <tr>
              <th scope='row'>Created</th>
              <td>{subnet.created_at}</td>
            </tr>
            <tr>
              <th scope='row' className='with-tooltip'>
                <span className='p-tooltip--top-left' aria-describedby="genesis-tooltip">
                  Genesis Block&nbsp;<i className="p-icon--information"></i>
                  <span className="p-tooltip__message" role="tooltip" id="genesis-tooltip">Parent block in which the subnet was created</span>
                </span>
              </th>
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
