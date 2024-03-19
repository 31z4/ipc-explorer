import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RootBlockLink } from '../RootBlockLink'
import { listSubnets } from '../ipc'

function SubnetList ({ subnets }) {
  let caption = ''
  if (subnets.length === 0) {
    caption = (
      <caption>
        <div className='p-strip'>
          <div className='row'>
            <p className='p-heading--4'>No subnets found</p>
          </div>
        </div>
      </caption>
    )
  }

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
      {caption}
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
        <p className="p-card__content">Block Height</p>
      </div>
    </div>
  )
}

export default function Root () {
  const [subnets, setSubnets] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(null)

  // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
  // See https://github.com/remix-run/react-router/issues/9277
  useEffect(() => {
    listSubnets().then(value => {
      setSubnets(value)
      setLoading(false)
    }, (err) => {
      setError(err)
      setLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <div className='p-strip u-align--center'>
        <span className="u-has-icon p-heading--4">
          <i className="p-icon--in-progress u-animation--spin"></i>Loading subnets...
        </span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='p-strip u-align--center'>
        <span className='u-has-icon p-heading--4'>
          <i className='p-icon--error'></i>Oops! Something went wrong
        </span>
      </div>
    )
  }

  return (
    <>
      <SubnetStats stats={subnets.stats} />
      <SubnetList subnets={subnets.list} />
    </>
  )
}
