import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSubnets } from '../ipc'

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
    <table>
      <thead>
        <tr>
          <th>Subnet ID</th>
          <th>Collateral</th>
          <th>Circulating Supply</th>
          <th>Genesis</th>
        </tr>
      </thead>
      <tbody>
        {subnets.map(s => (
          <>
            <tr>
              <td><Link to={`subnets${s.subnetId}`} state={{ subnetAddr: s.subnetAddr }}>{s.subnetId}</Link></td>
              <td>{s.collateral}</td>
              <td>{s.circulatingSupply}</td>
              <td>{s.genesis}</td>
            </tr>
          </>
        ))}
      </tbody>
    </table>
  )
}
