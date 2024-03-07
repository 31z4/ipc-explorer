"use client";

import { ethers } from "ethers";
import { useEffect, useState } from 'react';

async function listSubnets() {
  const provider = new ethers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");

  const gatewayAddress = "0xfA6D6c9ccDE5B8a34690F0377F07dbf932b457aC";
  const gatewayGetterAbi = [
    `function listSubnets() view returns (
      tuple(
        uint256 stake,
        uint256 genesisEpoch,
        uint256 circSupply,
        uint64 topDownNonce,
        uint64 appliedBottomUpNonce,
        tuple(uint64 root, address[] route) subnetID
      )[]
    )`,
  ];
  const gatewayGetterContract = new ethers.Contract(gatewayAddress, gatewayGetterAbi, provider);

  const subnets = await gatewayGetterContract.listSubnets();
  return subnets.map(s => {
    return {
      subnetID: `/r${s.subnetID.root.toString()}/${s.subnetID.route[0]}`,
      collateral: ethers.formatUnits(s.stake) + ' FIL',
      circulatingSupply: ethers.formatUnits(s.circSupply) + ' FIL',
      genesis: s.genesisEpoch.toString(),
    }
  })
}

export default function Page() {
  const [subnets, setSubnets] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    listSubnets().then(value => {
      setSubnets(value);
      setLoading(false);
    });
  }, []);

  if (isLoading) return <p>Listing subnets...</p>;
  if (!subnets) return <p>No subnets found</p>;

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
              <td>{s.subnetID}</td>
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
