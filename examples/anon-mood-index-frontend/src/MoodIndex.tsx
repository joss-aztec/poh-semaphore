import { useContractRead } from "wagmi";
import { contractAddresses } from "./contract_addresses";
import { anonMoodIndex } from "./abi/anon_mood_index";
import UpdateMoodIndex from "./UpdateMoodIndex";

const USER_MOOD_INDEX = {
  addressOrName: contractAddresses.goerli.anonMoodIndex,
  contractInterface: anonMoodIndex.abi,
  functionName: "userMoodIndex",
};

const USER_EXISTS = {
  addressOrName: contractAddresses.goerli.anonMoodIndex,
  contractInterface: anonMoodIndex.abi,
  functionName: "userExists",
};

export default function MoodIndex(props: { userId: string }) {
  const { data: userExistsResult, isLoading: isLoadingUserExists } =
    useContractRead({
      ...USER_EXISTS,
      args: [props.userId],
      enabled: !!props.userId,
      watch: true,
    });
  const userExists = !!userExistsResult;

  const { data: moodIndexResult, isLoading: isLoadingMoodIndex } =
    useContractRead({
      ...USER_MOOD_INDEX,
      args: [props.userId],
      enabled: userExists,
      watch: true,
    });

  const moodIndex = moodIndexResult?.toString();

  return (
    <div>
      {isLoadingUserExists && <p>Loading...</p>}
      {!isLoadingUserExists && !userExists && (
        <p>You've never given your mood index</p>
      )}
      {userExists && isLoadingMoodIndex && <p>Loading mood index...</p>}
      {moodIndex !== undefined && <p>Most recent mood index: {moodIndex}</p>}
      <UpdateMoodIndex />
    </div>
  );
}
