import { Subgraph } from "@semaphore-protocol/subgraph";
import { config } from "./config";

export async function getMembers(skipZeros = false) {
  const subgraph = new Subgraph(config.network);
  const group = await subgraph.getGroup(config.groupId, {
    members: true,
  });
  const members: string[] = group.members;
  if (skipZeros) return members.filter((member) => member !== "0");
  return members;
}
