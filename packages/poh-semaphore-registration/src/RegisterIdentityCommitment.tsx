import { ethers } from "ethers";
import { useState } from "react";
import {
  generateIdentityCommitment,
  IDENTITY_SIGNING_MESSAGE,
} from "poh-semaphore-client";
import {
  useContractWrite,
  usePrepareContractWrite,
  useSignMessage,
} from "wagmi";
import { pohSemaphore } from "./abi/poh_semaphore";
import { contractAddresses } from "./contract_addresses";

const REGISTER_IDENTITY_COMMITMENT = {
  addressOrName: contractAddresses.goerli.pohSemaphore,
  contractInterface: pohSemaphore.abi,
  functionName: "registerIdentityCommitment",
  overrides: {
    value: ethers.utils.parseEther("0.01"),
  },
};

type SubmissionArgs = [
  string // identityCommitment
];

export default function RegisterIdentityCommitment(props: { address: string }) {
  const { signMessageAsync } = useSignMessage({
    message: IDENTITY_SIGNING_MESSAGE,
  });
  const [submissionArgs, setSubmissionArgs] = useState<SubmissionArgs>();
  const [generating, setGenerating] = useState(false);
  const { config, isError: hasPrepError } = usePrepareContractWrite({
    ...REGISTER_IDENTITY_COMMITMENT,
    args: submissionArgs,
  });
  const {
    isLoading,
    isSuccess,
    write,
    isError: hasWriteError,
  } = useContractWrite(config);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const signedMessage = await signMessageAsync();
      const identityCommitment = generateIdentityCommitment(signedMessage);
      setSubmissionArgs([identityCommitment.toString()]);
    } catch {}
    setGenerating(false);
  };
  return (
    <div>
      <p>
        You do not currently have an identity commitment registered on PoH
        Semaphore.
      </p>
      {generating && <p>Generating identity...</p>}
      {!generating && !submissionArgs && (
        <button onClick={handleGenerate}>Generate</button>
      )}
      {submissionArgs && !isLoading && !isSuccess && (
        <button disabled={!write} onClick={() => write?.()}>
          Submit generated identity
        </button>
      )}
      {submissionArgs && hasPrepError && <p>Error preparing transaction</p>}
      {hasWriteError && <p>Error sending transaction</p>}
      {isLoading && <p>Writing to contract...</p>}
      {isSuccess && <p>PoH Semaphore registration submitted!</p>}
    </div>
  );
}
