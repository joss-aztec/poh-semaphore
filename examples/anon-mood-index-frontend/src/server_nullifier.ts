import { BigNumber, ethers } from "ethers";

function nameToNullifier(name: string) {
  const snarkScalarField =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n;
  return BigNumber.from(ethers.utils.sha256(ethers.utils.toUtf8Bytes(name)))
    .mod(snarkScalarField)
    .toString();
}

export const ANON_MOOD_INDEX_SERVICE_NULLIFIER =
  nameToNullifier("AnonMoodIndex");
