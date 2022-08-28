import { useContractRead } from "wagmi";
import { contractAddresses } from "./contract_addresses";
import { anonMoodIndex } from "./abi/anon_mood_index";

const AVERAGE_MOOD_INDEX = {
  addressOrName: contractAddresses.goerli.anonMoodIndex,
  contractInterface: anonMoodIndex.abi,
  functionName: "averageMoodIndex",
  watch: true,
};

export default function AverageMoodIndex() {
  const {
    data: moodIndexResult,
    isLoading,
    isError,
  } = useContractRead(AVERAGE_MOOD_INDEX);

  const moodIndex = moodIndexResult?.toString();

  return (
    <div>
      <h2>Average Mood Index</h2>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading average mood index</p>}
      {moodIndex !== undefined && (
        <p>Average mood index of all users: {moodIndex}</p>
      )}
    </div>
  );
}
