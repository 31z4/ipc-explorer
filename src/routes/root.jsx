import { useEffect, useState } from 'react'
import { SubnetList } from '../SubnetList'
import { SubnetStats } from '../SubnetStats'
import { listSubnets } from '../ipc'

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
      console.error(err)
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
