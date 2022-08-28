// @ts-ignore
import { buildPoseidon } from "circomlibjs";
// @ts-ignore
import { groth16 } from "snarkjs";
import { Proof } from "./types";

interface NullifierConsistencyFullProof {
  proof: Proof;
  identityProxy: string;
  externalNullifier: string;
  nullifierHash: string;
}

export async function generateNullifierConsistencyProof(
  serviceNullifier: string,
  privIdentityNullifier: string,
  privRandomNonce: string
): Promise<NullifierConsistencyFullProof> {
  const poseidon = await buildPoseidon();
  const hash = (x1: string, x2: string): string => {
    const uint8Arr = poseidon([x1, x2]);
    return poseidon.F.toObject(uint8Arr).toString();
  };
  const identityProxy = hash(serviceNullifier, privIdentityNullifier);
  const externalNullifier = hash(identityProxy, privRandomNonce);
  const nullifierHash = hash(externalNullifier, privIdentityNullifier);
  const input = {
    privIdentityNullifier,
    privRandomNonce,
    identityProxy,
    serviceNullifier,
    externalNullifier,
    nullifierHash,
  };
  const wasmFile = `${window.location.origin}/NullifierConsistency.wasm`;
  const zkeyFilePath = `${window.location.origin}/circuit_final.zkey`;
  const { proof } = await groth16.fullProve(input, wasmFile, zkeyFilePath);
  return {
    proof,
    identityProxy,
    externalNullifier,
    nullifierHash,
  };
}
