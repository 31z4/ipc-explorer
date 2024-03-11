import { useParams } from "react-router"

export default function Subnet() {
    const subnetId  = `/${useParams()['*']}`

    return (
        <h1>{subnetId}</h1>
    )
}
