import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { recentTransactions } from '../eth'
import { genesisValidators, subnetDeposits, subnetWithdrawals } from '../ipc'

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
          <th>Federated Power</th>
          <th>Confirmed Collateral</th>
          <th>Total Collateral</th>
        </tr>
      </thead>
      <tbody>
        {validators.map(v => (
          <>
            <tr>
              <td>{v.addr}</td>
              <td>{v.federatedPower}</td>
              <td>{v.confirmedCollateral}</td>
              <td>{v.totalCollateral}</td>
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

export default function Subnet () {
  const subnetId = `/${useParams()['*']}`
  const subnetAddr = useLocation().state.subnetAddr

  return (
    <>
      <h2>Subnet {subnetId}</h2>
      <GenesisValidators subnetAddr={subnetAddr} />
      <Deposits subnetAddr={subnetAddr} />
      <Withdrawals subnetAddr={subnetAddr} />
      <Transactions subnetAddr={subnetAddr} />
    </>
  )
}
