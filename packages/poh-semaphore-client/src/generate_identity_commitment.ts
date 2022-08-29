import { Identity } from "@semaphore-protocol/identity";

export function generateIdentityCommitment(signedIdentityMessage: string) {
  const identity = new Identity(signedIdentityMessage);
  return identity.generateCommitment();
}
