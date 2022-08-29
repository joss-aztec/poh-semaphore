import { getMembers } from "poh-semaphore-client";
import { useEffect, useState } from "react";
import { useBlockNumber } from "wagmi";
import { GroupMember } from "./GroupMember";

function useMembers() {
  const [members, setMembers] = useState<string[]>();
  const { data: blockNumber } = useBlockNumber();
  useEffect(() => {
    getMembers(true).then(setMembers);
  }, [blockNumber]);
  return members;
}

export default function PohSemaphoreGroup() {
  const members = useMembers();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <h2>Existing PoH Semaphore members</h2>
      {!members && <p>Loading all exisiting PoH Semaphore group members...</p>}
      {members?.map((member) => (
        <GroupMember key={member} identityCommitment={member} />
      ))}
    </div>
  );
}
