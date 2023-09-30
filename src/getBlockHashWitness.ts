import { AxiomConfig, Axiom } from '@axiom-crypto/core';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();

export const getBlockHashWitness = async () => {
  const config: AxiomConfig = {
    providerUri: process.env.GOERLI_RPC_URL || "",
    version: "v1",
    chainId: 5,
    mock: false
  };
  const ax = new Axiom(config);

  const blockHashWitness = await ax.block.getBlockHashWitness(9785760);
  console.log(blockHashWitness);

  const providerUri = process.env.GOERLI_RPC_URL || ""
  const provider = new ethers.providers.JsonRpcProvider(providerUri);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
  console.log(ax.getAxiomAddress());
  const axiom = new ethers.Contract(
    ax.getAxiomAddress() as string,
    ax.getAxiomAbi(),
    wallet
  );

  const tx = await axiom.isBlockHashValid(
    blockHashWitness
  );
  console.log(tx);
}

getBlockHashWitness().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
