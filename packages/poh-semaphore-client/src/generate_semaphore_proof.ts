// Adapted from https://github.com/semaphore-protocol/semaphore.js/blob/main/packages/proof/src/generateProof.ts
// to support UInt8Array signal. (The original was constrained to utf8 econding.)

import { Group } from "@semaphore-protocol/group";
import type { Identity } from "@semaphore-protocol/identity";
import { ethers } from "ethers";
// @ts-ignore
import { groth16 } from "snarkjs";
import { BigNumberish, FullProof, SnarkArtifacts } from "./types";

function generateSignalHash(signal: Uint8Array): bigint {
  return BigInt(ethers.utils.keccak256(signal)) >> BigInt(8);
}

export async function generateSemaphoreProof(
  identity: Identity,
  group: Group,
  externalNullifier: BigNumberish,
  signal: Uint8Array,
  snarkArtifacts?: SnarkArtifacts
): Promise<FullProof> {
  const commitment = identity.generateCommitment();

  const index = group.indexOf(commitment);

  if (index === -1) {
    throw new Error("The identity is not part of the group");
  }

  const merkleProof = group.generateProofOfMembership(index);

  if (!snarkArtifacts) {
    snarkArtifacts = {
      wasmFilePath: `https://www.trusted-setup-pse.org/semaphore/${merkleProof.siblings.length}/semaphore.wasm`,
      zkeyFilePath: `https://www.trusted-setup-pse.org/semaphore/${merkleProof.siblings.length}/semaphore.zkey`,
    };
  }

  const { proof, publicSignals } = await groth16.fullProve(
    {
      identityTrapdoor: identity.getTrapdoor(),
      identityNullifier: identity.getNullifier(),
      treePathIndices: merkleProof.pathIndices,
      treeSiblings: merkleProof.siblings,
      externalNullifier,
      signalHash: generateSignalHash(signal),
    },
    snarkArtifacts.wasmFilePath,
    snarkArtifacts.zkeyFilePath
  );

  return {
    proof,
    publicSignals: {
      merkleRoot: publicSignals[0],
      nullifierHash: publicSignals[1],
      signalHash: publicSignals[2],
      externalNullifier: publicSignals[3],
    },
  };
}
