import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RootBlockLink } from '../RootBlockLink'
import { listSubnets } from '../ipc'

function SubnetList ({ subnets }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Subnet ID</th>
          <th>Collateral</th>
          <th>Circulating Supply</th>
          <th>Genesis</th>
          <th>Age</th>
        </tr>
      </thead>
      <tbody>
        {subnets.map(s => (
          <>
            <tr>
              <td><Link to={`subnets${s.subnetId}`} state={s}>{s.subnetId}</Link></td>
              <td>{s.collateral}</td>
              <td>{s.circulatingSupply}</td>
              <td><RootBlockLink block={s.genesis} /></td>
              <td>{s.age}</td>
            </tr>
          </>
        ))}
      </tbody>
    </table>
  )
}

function SubnetStats ({ stats }) {
  return (
    <table>
      <tbody>
          <tr>
            <th scope='row'>Total Subnets</th>
            <td>{stats.count}</td>
          </tr>
          <tr>
            <th scope='row'>Total Collateral</th>
            <td>{stats.totalCollateral}</td>
          </tr>
          <tr>
            <th scope='row'>Total Supply</th>
            <td>{stats.totalSupply}</td>
          </tr>
      </tbody>
    </table>
  )
}

export default function Root () {
  const [subnets, setSubnets] = useState(null)
  const [isLoading, setLoading] = useState(true)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    listSubnets().then(value => {
      setSubnets(value)
      setLoading(false)
    })
  }, [])

  if (isLoading) return <p>Loading subnets...</p>
  if (!subnets) return <p>No subnets found</p>

  return (
    <>
      <SubnetStats stats={subnets.stats} />
      <SubnetList subnets={subnets.list} />
    </>
  )
}
