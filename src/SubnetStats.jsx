export function SubnetStats ({ stats }) {
  return (
      <div className='row'>
        <div className="p-card--highlighted col-4">
          <h3>{stats.count}</h3>
          <p className="p-card__content">Total Subnets</p>
        </div>
        <div className="p-card--highlighted col-4">
          <h3>{stats.totalCollateral}</h3>
          <p className="p-card__content">Total Collateral</p>
        </div>
        <div className="p-card--highlighted col-4">
          <h3>{stats.totalSupply}</h3>
          <p className="p-card__content">Total Supply</p>
        </div>
      </div>
  )
}
