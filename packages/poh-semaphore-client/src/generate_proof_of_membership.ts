import { Group } from "@semaphore-protocol/group";
import { config } from "./config";
import { getMembers } from "./get_members";

export async function generateProofOfMembership(identityCommitment: string) {
  const members = await getMembers();
  const group = new Group(config.treeDepth, config.zeroValue);
  group.addMembers(members);
  const proof = group.generateProofOfMembership(
    group.indexOf(BigInt(identityCommitment))
  );
  return proof;
}
