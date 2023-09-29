import * as dotenv from 'dotenv';
dotenv.config();

import { Axiom, AxiomConfig } from "@axiom-crypto/core";
import { ethers } from 'ethers';

const QUERY_ADDRESS = "0x66B0Cfd7d418DAa54CA81E91F63D7B0a7f01fb14";
const REFUND_ADDRESS = "0x1aaaeb006AC4DE12C4630BB44ED00A764f37bef8"

async function main() {
  const config: AxiomConfig = {
    providerUri: process.env.GOERLI_RPC_URL || "",
    version: "v1",
    chainId: 5,
    mock: false
  };
  const ax = new Axiom(config);

  const providerUri = process.env.OPTIMISM_RPC_URL || ""
  const provider = new ethers.JsonRpcProvider(providerUri);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
  const axiomV1Query = new ethers.Contract(
    QUERY_ADDRESS,
    ax.getAxiomQueryAbi(),
    wallet
  );

  const qb = ax.newQueryBuilder();

  const UNI_V2_ADDR = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  await qb.append({ blockNumber: 9221736 });
  await qb.append({ blockNumber: 9221524, address: UNI_V2_ADDR });
  await qb.append({ blockNumber: 9221524, address: UNI_V2_ADDR, slot: 0 });
  await qb.append({ blockNumber: 9221524, address: UNI_V2_ADDR, slot: 1 });

  const { keccakQueryResponse, queryHash, query } = await qb.build();

  const txResult = await axiomV1Query.sendQuery(
    keccakQueryResponse,
    REFUND_ADDRESS,
    query,
    {
      value: ethers.parseEther("0.01"), // Goerli payment value
    }
  );
  const txReceipt = await txResult.wait();
  console.log(txReceipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});