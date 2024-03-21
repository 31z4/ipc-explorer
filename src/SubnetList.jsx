import { Link } from 'react-router-dom'
import { RootBlockLink } from './RootBlockLink'

export function SubnetList ({ subnets }) {
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
                <td className='u-truncate'><Link to={`subnets${s.subnetId}`} state={s} onClick= {() => window.scrollTo(0, 0)}>{s.subnetIdShort}</Link></td>
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
