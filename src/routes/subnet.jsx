import { useEffect, useState } from 'react'
import { useParams } from "react-router"
import { genesisValidators } from '../ipc'

function GenesisValidators({ subnetId }) {
    const [validators, setValidators] = useState(null)
    const [isLoading, setLoading] = useState(true)

    // I didn't manage to implement proper loading state using React Router's `useLoaderData` and `useNavigation`.
    // See https://github.com/remix-run/react-router/issues/9277
    useEffect(() => {
        genesisValidators(subnetId).then(value => {
            setValidators(value)
            setLoading(false)
        })
    }, [subnetId])

    let content;
    if (isLoading)
        content = <p>Loading validators...</p>
    else if (!validators)
        content = <p>No validators found</p>
    else
        content = (
            <table>
            <thead>
                <tr>
                <th>Address</th>
                <th>Weight</th>
                </tr>
            </thead>
            <tbody>
                {validators.map(v => (
                <>
                    <tr>
                    <td>{v.addr}</td>
                    <td>{v.weight}</td>
                    </tr>
                </>
                ))}
            </tbody>
            </table>
        )

    return (
        <>
            <h3>Genesis Validators</h3>
            {content}
        </>
    )
}

export default function Subnet() {
    const subnetId = `/${useParams()['*']}`

    return (
        <>
            <h2>{subnetId}</h2>
            <GenesisValidators subnetId={subnetId} />
        </>
    )
}
