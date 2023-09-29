"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const core_1 = require("@axiom-crypto/core");
const ethers_1 = require("ethers");
const QUERY_ADDRESS = "0x66B0Cfd7d418DAa54CA81E91F63D7B0a7f01fb14";
const REFUND_ADDRESS = "0x1aaaeb006AC4DE12C4630BB44ED00A764f37bef8";
async function main() {
    const config = {
        providerUri: process.env.GOERLI_RPC_URL || "",
        version: "v1",
        chainId: 5,
        mock: false
    };
    const ax = new core_1.Axiom(config);
    const providerUri = process.env.OPTIMISM_RPC_URL || "";
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(providerUri);
    const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
    const axiomV1Query = new ethers_1.ethers.Contract(QUERY_ADDRESS, ax.getAxiomQueryAbi(), wallet);
    const qb = ax.newQueryBuilder();
    console.log("QueryBuilder:", qb);
    const UNI_V2_ADDR = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    await qb.append({ blockNumber: 9221737 });
    await qb.append({ blockNumber: 9221525, address: UNI_V2_ADDR });
    await qb.append({ blockNumber: 9221525, address: UNI_V2_ADDR, slot: 0 });
    await qb.append({ blockNumber: 9221525, address: UNI_V2_ADDR, slot: 1 });
    const { keccakQueryResponse, queryHash, query } = await qb.build();
    const txResult = await axiomV1Query.sendQuery(keccakQueryResponse, REFUND_ADDRESS, query, {
        value: ethers_1.ethers.utils.parseEther("0.01"),
        gasLimit: 1000000,
    });
    const txReceipt = await txResult.wait();
    console.log(txReceipt);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
