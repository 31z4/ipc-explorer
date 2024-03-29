import { useEffect, useState } from 'react'
import { HeaderWithTooltip } from './HeaderWithTooltip'
import { lastCheckpoint } from './ipc'

function Messages ({ messages }) {
  let caption = ''
  if (messages.length === 0) {
    caption = (
      <caption>
        No messages
      </caption>
    )
  }

  return (
    <>
      <h5>Checkpoint Messages</h5>
      <table>
      <thead>
        <tr>
          <th>Kind</th>
          <th>From</th>
          <th>To</th>
          <th>Value</th>
        </tr>
      </thead>
      {caption}
      <tbody>
        {messages.map(w => (
          <>
            <tr>
              <td>{w.kind}</td>
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

export function LastCheckpoint ({ subnetAddr }) {
  const [checkpoint, setCheckpoint] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(null)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    lastCheckpoint(subnetAddr).then(value => {
      setCheckpoint(value)
      setLoading(false)
    }, (err) => {
      setError(err)
      setLoading(false)
      console.error(err)
    })
  }, [subnetAddr])

  let content = ''
  if (isLoading) {
    content = (
      <table>
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--in-progress u-animation--spin"></i>Loading checkpoint...
          </span>
        </caption>
      </table>
    )
  } else if (isError) {
    content = (
      <table>
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--warning"></i>Could not load checkpoint
          </span>
        </caption>
      </table>
    )
  } else if (!checkpoint.exists) {
    content = (
      <table>
        <caption>
          <span className="u-has-icon">
            <i className="p-icon--warning"></i>No committed bottom-up checkpoint
          </span>
        </caption>
      </table>
    )
  } else {
    content = (
      <>
        <table>
          <tbody>
            <tr>
              <HeaderWithTooltip
                header="Block Height"
                headerScope="row"
                tooltip="Subnet block height"
                tooltipPosition="top-left"
              />
              <td>{checkpoint.blockHeight}</td>
            </tr>
            <tr>
              <HeaderWithTooltip
                header="Block Hash"
                headerScope="row"
                tooltip="Subnet block hash"
                tooltipPosition="top-left"
              />
              <td>{checkpoint.blockHash}</td>
            </tr>
            <tr>
              <HeaderWithTooltip
                header="Next Configuration Number"
                headerScope="row"
                tooltip="The number of the membership (validator set) which is going to sign the next checkpoint"
                tooltipPosition="top-left"
              />
              <td>{checkpoint.nextConfigurationNumber}</td>
            </tr>
          </tbody>
        </table>
        <Messages messages={checkpoint.msgs} />
      </>
    )
  }

  return (
      <>
        <h3>Last Checkpoint</h3>
        {content}
      </>
  )
}
