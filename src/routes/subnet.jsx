import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { RootBlockLink } from '../RootBlockLink'
import { RootContractLink } from '../RootContractLink'
import { recentTransactions } from '../eth'
import { genesisValidators, subnetDeposits, subnetInfo, subnetWithdrawals } from '../ipc'

function GenesisValidators ({ subnetAddr }) {
  const [validators, setValidators] = useState(null)
  const [isLoading, setLoading] = useState(true)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    genesisValidators(subnetAddr).then(value => {
      setValidators(value)
      setLoading(false)
    })
  }, [subnetAddr])

  let content
  if (isLoading) { content = <p>Loading validators...</p> } else if (!validators) { content = <p>No validators found</p> } else {
    content = (
      <table>
      <thead>
        <tr>
          <th>Address</th>
          <th>Confirmed Collateral</th>
          <th>Total Collateral</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        {validators.map(v => (
          <>
            <tr>
              <td><RootContractLink addr={v.addr} /></td>
              <td>{v.confirmedCollateral}</td>
              <td>{v.totalCollateral}</td>
              <td>{v.state}</td>
            </tr>
          </>
        ))}
      </tbody>
      </table>
    )
  }

  return (
    <>
      <h3>Genesis Validators</h3>
      {content}
    </>
  )
}

function Deposits ({ subnetAddr }) {
  const [deposits, setDeposits] = useState(null)
  const [isLoading, setLoading] = useState(true)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    subnetDeposits(subnetAddr).then(value => {
      setDeposits(value)
      setLoading(false)
    })
  }, [subnetAddr])

  let content
  if (isLoading) { content = <p>Loading deposits...</p> } else if (!deposits.length) { content = <p>No deposits found</p> } else {
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
        {deposits.map(d => (
          <>
            <tr>
              <td>{d.transactionHash}</td>
              <td>{d.from}</td>
              <td>{d.to}</td>
              <td>{d.value}</td>
            </tr>
          </>
        ))}
      </tbody>
      </table>
    )
  }

  return (
    <>
      <h3>Deposits</h3>
      {content}
    </>
  )
}

function Withdrawals ({ subnetAddr }) {
  const [withdrawals, setWithdrawals] = useState(null)
  const [isLoading, setLoading] = useState(true)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    subnetWithdrawals(subnetAddr).then(value => {
      setWithdrawals(value)
      setLoading(false)
    })
  }, [subnetAddr])

  let content
  if (isLoading) {
    content = <p>Loading withdrawals...</p>
  } else if (withdrawals === undefined) {
    content = <p>Not connected to subnet RPC</p>
  } else if (!withdrawals.length) {
    content = <p>No withdrawals found</p>
  } else {
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

function Transactions ({ subnetAddr }) {
  const [transactions, setTransactions] = useState(null)
  const [isLoading, setLoading] = useState(true)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    recentTransactions(subnetAddr).then(value => {
      setTransactions(value)
      setLoading(false)
    })
  }, [subnetAddr])

  let content
  if (isLoading) {
    content = <p>Loading transactions...</p>
  } else if (transactions === undefined) {
    content = <p>Not connected to subnet RPC</p>
  } else if (!transactions.length) {
    content = <p>No transactions found</p>
  } else {
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

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    subnetInfo(subnet.subnetAddr).then(value => {
      setInfo(value)
      setLoading(false)
    })
  }, [subnet.subnetAddr])

  let content
  if (isLoading) {
    content = (
        <tr>
          <td>Loading subnet info...</td>
        </tr>
    )
  } else if (!info) {
    content = (
      <tr>
        <td>Could not load subnet info</td>
      </tr>
    )
  } else {
    const contract = info.supplySourceAddr ? <RootContractLink addr={info.supplySourceAddr} /> : ''
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
          <td>{info.state}</td>
        </tr>
      </>
    )
  }

  return (
    <table>
      <tbody>
          <tr>
            <th scope='row'>Contract Address</th>
            <td><RootContractLink addr={subnet.subnetAddr} /></td>
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
  const subnetId = `/${useParams()['*']}`
  const subnet = useLocation().state

  return (
    <>
      <h2>Subnet {subnetId}</h2>
      <SubnetInfo subnet={subnet} />
      <GenesisValidators subnetAddr={subnet.subnetAddr} />
      <Deposits subnetAddr={subnet.subnetAddr} />
      <Withdrawals subnetAddr={subnet.subnetAddr} />
      <Transactions subnetAddr={subnet.subnetAddr} />
    </>
  )
}
