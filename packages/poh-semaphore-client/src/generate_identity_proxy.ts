import { Identity } from "@semaphore-protocol/identity";
// @ts-ignore
import { buildPoseidon } from "circomlibjs";

export async function generateIdentityProxy(
  serviceNullifier: string,
  signedIdentityMessage: string
) {
  const identity = new Identity(signedIdentityMessage);
  const identityNullifier = identity.getNullifier();
  const poseidon = await buildPoseidon();
  const identityProxyUint8Array = poseidon([
    serviceNullifier,
    identityNullifier,
  ]);
  const identityProxy = poseidon.F.toObject(identityProxyUint8Array).toString();
  return identityProxy;
}
