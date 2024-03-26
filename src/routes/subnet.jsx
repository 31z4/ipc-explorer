import { useState } from 'react'
import { useLocation } from 'react-router'
import { Deposits } from '../Deposits'
import { GenesisValidators } from '../GenesisValidators'
import { LastCheckpoint } from '../LastCheckpoint'
import { SubnetInfo } from '../SubnetInfo'
import { Transactions } from '../Transactions'
import { Withdrawals } from '../Withdrawals'
import { SUBNET_RPC_PROVIDERS } from '../ipc'

export default function Subnet () {
  const subnet = useLocation().state
  const [providerUrl, setProviderUrl] = useState(SUBNET_RPC_PROVIDERS.get(subnet.subnetAddr))

  function promptProviderUrl () {
    const url = window.prompt('Enter subnet RPC provider URL', 'http://localhost:8545')
    if (url) { setProviderUrl(url) }
  }

  return (
    <>
      <h3 className='u-truncate'><a href="#">/r314159</a>/{subnet.subnetIdShort}</h3>
      <SubnetInfo subnet={subnet} />
      <LastCheckpoint subnetAddr={subnet.subnetAddr} />
      <GenesisValidators subnetAddr={subnet.subnetAddr} />
      <Deposits subnetAddr={subnet.subnetAddr} />
      <Withdrawals providerUrl={providerUrl} setProviderUrl={promptProviderUrl} />
      <Transactions providerUrl={providerUrl} setProviderUrl={promptProviderUrl} />
    </>
  )
}
