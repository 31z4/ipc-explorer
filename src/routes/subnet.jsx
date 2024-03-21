import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { RootAddressLink } from '../RootAddressLink'
import { RootBlockLink } from '../RootBlockLink'
import { RootMessageLink } from '../RootMessageLink'
import { SUBNET_RPC_PROVIDERS, genesisValidators, subnetDeposits, subnetInfo, subnetWithdrawals } from '../ipc'

import { recentTransactions } from '../eth'

function GenesisValidators ({ subnetAddr }) {
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
          <th>Confirmed Collateral</th>
          <th>Total Collateral</th>
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

function Deposits ({ subnetAddr }) {
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
              <td><RootAddressLink addr={d.from} /></td>
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

function Withdrawals ({ providerUrl, setProviderUrl }) {
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

function Transactions ({ providerUrl, setProviderUrl }) {
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

function SubnetInfo ({ subnet }) {
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

export default function Subnet () {
  const subnet = useLocation().state

  const [providerUrl, setProviderUrl] = useState(SUBNET_RPC_PROVIDERS.get(subnet.subnetAddr))

  function promptProviderUrl () {
    const url = window.prompt('Enter subnet RPC provider URL', 'http://localhost:8545')
    if (url) { setProviderUrl(url) }
  }

  return (
    <>
      <h3 className='u-truncate'><a href="#">/r314159</a>/{subnet.subnetIdShort}</h3>
      <SubnetInfo subnet={subnet} />
      <GenesisValidators subnetAddr={subnet.subnetAddr} />
      <Deposits subnetAddr={subnet.subnetAddr} />
      <Withdrawals providerUrl={providerUrl} setProviderUrl={promptProviderUrl} />
      <Transactions providerUrl={providerUrl} setProviderUrl={promptProviderUrl} />
    </>
  )
}
