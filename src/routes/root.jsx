import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RootBlockLink } from '../RootBlockLink'
import { listSubnets } from '../ipc'

function SubnetList ({ subnets }) {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: '33%' }}>Subnet ID</th>
          <th >Collateral</th>
          <th >Circulating Supply</th>
          <th >Genesis</th>
          <th >Age</th>
        </tr>
      </thead>
      <tbody>
        {subnets.map(s => (
          <>
            <tr>
              {/* Passing state won't work if opening in a new tab or window. */}
              <td className='u-truncate'><Link to={`subnets${s.subnetId}`} state={s}>{s.subnetIdShort}</Link></td>
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
    <div className='row--25-25-25-25'>
      <div className="p-card--highlighted col">
        <h3>{stats.count}</h3>
        <p className="p-card__content">Total Subnets</p>
      </div>
      <div className="p-card--highlighted col">
        <h3>{stats.totalCollateral}</h3>
        <p className="p-card__content">Total Collateral</p>
      </div>
      <div className="p-card--highlighted col">
        <h3>{stats.totalSupply}</h3>
        <p className="p-card__content">Total Supply</p>
      </div>
      <div className="p-card--highlighted col">
        <h3>{stats.rootBlock}</h3>
        <p className="p-card__content">Root Block</p>
      </div>
    </div>
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
