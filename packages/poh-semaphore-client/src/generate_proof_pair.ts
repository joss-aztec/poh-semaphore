import { Identity } from "@semaphore-protocol/identity";
import { BigNumber } from "ethers";
import { randomBytes } from "ethers/lib/utils";
import { Group } from "@semaphore-protocol/group";
import { config } from "./config";
import { generateSemaphoreProof } from "./generate_semaphore_proof";
import { generateNullifierConsistencyProof } from "./generate_nullifier_consistency_proof";
import { Proof } from "./types";
import { getMembers } from "./get_members";

function genRandomNumber(numberOfBytes = 31): string {
  return BigNumber.from(randomBytes(numberOfBytes)).toString();
}

function flattenProofAbc(proof: Proof) {
  return [
    proof.pi_a[0],
    proof.pi_a[1],
    proof.pi_b[0][1],
    proof.pi_b[0][0],
    proof.pi_b[1][1],
    proof.pi_b[1][0],
    proof.pi_c[0],
    proof.pi_c[1],
  ].map((x) => x.toString(16));
}

export async function generateProofPair(
  signedIdentityMessage: string,
  serviceNullifier: string,
  signal: Uint8Array
) {
  const identity = new Identity(signedIdentityMessage);
  const nullifierConsistencyFullProof = await generateNullifierConsistencyProof(
    serviceNullifier,
    identity.getNullifier().toString(),
    genRandomNumber()
  );
  const members = await getMembers();
  const group = new Group(config.treeDepth, config.zeroValue);
  group.addMembers(members);
  const semaphoreFullProof = await generateSemaphoreProof(
    identity,
    group,
    nullifierConsistencyFullProof.externalNullifier,
    signal,
    {
      wasmFilePath: `${window.location.origin}/semaphore.wasm`,
      zkeyFilePath: `${window.location.origin}/semaphore.zkey`,
    }
  );
  const nullifierConsistencyProofAbc = flattenProofAbc(
    nullifierConsistencyFullProof.proof
  );
  const semaphoreProofAbc = flattenProofAbc(semaphoreFullProof.proof);
  const { identityProxy, externalNullifier, nullifierHash } =
    nullifierConsistencyFullProof;
  return {
    nullifierConsistencyProofAbc,
    semaphoreProofAbc,
    identityProxy,
    externalNullifier,
    nullifierHash,
  };
}
