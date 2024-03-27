export function RootAddressLink ({ addrShort, addrFull }) {
  return <a href={`https://calibration.filfox.info/en/address/${addrShort}`} target='blank'>{addrFull}</a>
}
