import { generateProofOfMembership } from "poh-semaphore-client";
import { useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { pohSemaphore } from "./abi/poh_semaphore";
import { contractAddresses } from "./contract_addresses";

const DEREGISTER_IDENTITY_COMMITMENT = {
  addressOrName: contractAddresses.goerli.pohSemaphore,
  contractInterface: pohSemaphore.abi,
  functionName: "deregisterIdentityCommitment",
};

type SubmissionArgs = [
  string, // idenitityCommitment
  string[], //proofSiblings,
  string[] //proofPathIndices
];

export function DeregisterMember(props: {
  identityCommitment: string;
  address: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [submissionArgs, setSubmissionArgs] = useState<SubmissionArgs>();
  const { config, isError: hasPrepError } = usePrepareContractWrite({
    ...DEREGISTER_IDENTITY_COMMITMENT,
    args: submissionArgs,
  });

  const {
    isLoading,
    isSuccess,
    write,
    isError: hasWriteError,
  } = useContractWrite(config);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const proof = await generateProofOfMembership(props.identityCommitment);
      setSubmissionArgs([
        props.address,
        proof.siblings.map((x) => x.toString()),
        proof.pathIndices.map((x) => x.toString()),
      ]);
    } catch (err) {
      console.error(err);
    }
    setIsGenerating(false);
  };
  return (
    <div>
      <p>Prove this user's deregistration to claim their deposit</p>
      {isGenerating && <p>Generating proof...</p>}
      {!isGenerating && !submissionArgs && (
        <button onClick={handleGenerate}>Generate proof</button>
      )}
      {submissionArgs && !isLoading && !isSuccess && (
        <button disabled={!write} onClick={() => write?.()}>
          Submit generated proof
        </button>
      )}
      {submissionArgs && hasPrepError && <p>Error preparing transaction</p>}
      {hasWriteError && <p>Error sending transaction</p>}
      {isLoading && <p>Writing to contract...</p>}
      {isSuccess && <p>PoH Semaphore deregistration submitted!</p>}
    </div>
  );
}
