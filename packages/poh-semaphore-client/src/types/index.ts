// Adapted from https://github.com/semaphore-protocol/semaphore.js/blob/main/packages/proof/src/types/index.ts

export type BigNumberish = string | bigint;

export type SnarkArtifacts = {
  wasmFilePath: string;
  zkeyFilePath: string;
};

export type Proof = {
  pi_a: BigNumberish[];
  pi_b: BigNumberish[][];
  pi_c: BigNumberish[];
  protocol: string;
  curve: string;
};

export type FullProof = {
  proof: Proof;
  publicSignals: PublicSignals;
};

export type PublicSignals = {
  merkleRoot: BigNumberish;
  nullifierHash: BigNumberish;
  signalHash: BigNumberish;
  externalNullifier: BigNumberish;
};
