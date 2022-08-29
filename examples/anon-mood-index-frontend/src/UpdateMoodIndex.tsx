import { ethers } from "ethers";
import { useState } from "react";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useSignMessage,
} from "wagmi";
import { anonMoodIndex } from "./abi/anon_mood_index";
import { contractAddresses } from "./contract_addresses";
import {
  generateProofPair,
  IDENTITY_SIGNING_MESSAGE,
} from "poh-semaphore-client";
import { ANON_MOOD_INDEX_SERVICE_NULLIFIER } from "./server_nullifier";

const UPDATE_MOOD_INDEX = {
  addressOrName: contractAddresses.goerli.anonMoodIndex,
  contractInterface: anonMoodIndex.abi,
  functionName: "updateMoodIndexVerifiably",
};

function toMoodIndexHashSignal(moodIndex: number) {
  return ethers.utils.arrayify(
    ethers.utils.keccak256(ethers.utils.arrayify(moodIndex))
  );
}

type SubmissionArgs = [
  number, // moodIndex,
  string, // moodIndexHashSignal,
  string, // nullifierHash,
  string, // serviceNullifier,
  string, // externalNullifier,
  string, // identityProxy,
  string[], // nullifierConsistencyProof,
  string[] // semaphoreProof
];

async function generateSubmission(
  signedMessage: string,
  moodIndex: number
): Promise<SubmissionArgs> {
  const signal = toMoodIndexHashSignal(moodIndex);
  const proofPair = await generateProofPair(
    signedMessage,
    ANON_MOOD_INDEX_SERVICE_NULLIFIER,
    signal
  );

  return [
    moodIndex,
    ethers.utils.hexlify(signal),
    proofPair.nullifierHash,
    ANON_MOOD_INDEX_SERVICE_NULLIFIER,
    proofPair.externalNullifier,
    proofPair.identityProxy,
    proofPair.nullifierConsistencyProofAbc,
    proofPair.semaphoreProofAbc,
  ];
}

function usePrepareSubmission(
  moodIndex: number,
  signerAddress: string | undefined
) {
  const [state, setState] = useState({
    error: null as null | Error,
    busy: false,
    result: null as null | SubmissionArgs,
    signerAddress: null as null | string,
  });
  if (!signerAddress) throw new Error("No signer address");
  const { signMessageAsync } = useSignMessage({
    message: IDENTITY_SIGNING_MESSAGE,
  });
  const prepareSubmission = async () => {
    setState({ error: null, busy: true, result: null, signerAddress: null });
    try {
      const signedMessage = await signMessageAsync();
      const result = await generateSubmission(signedMessage, moodIndex);
      setState({ error: null, busy: false, result, signerAddress });
    } catch (error) {
      console.error(error);
      setState({
        error: error as Error,
        busy: false,
        result: null,
        signerAddress: null,
      });
    }
  };
  return [prepareSubmission, state] as const;
}

export default function UpdateMoodIndex() {
  const [moodIndex, setMoodIndex] = useState(128);
  const { address } = useAccount();
  const [
    prepareSubmission,
    {
      error: prepareSubmissionError,
      busy: isPreparingSubmission,
      result: submissionArgs,
      signerAddress: preparedBy,
    },
  ] = usePrepareSubmission(moodIndex, address);
  const shouldChangeSigner = !!preparedBy && address === preparedBy;
  const {
    config: writeConfig,
    isError: prepareConfigHasError,
    isLoading: prepareConfigIsLoading,
  } = usePrepareContractWrite({
    ...UPDATE_MOOD_INDEX,
    args: submissionArgs,
    enabled: !!submissionArgs && !shouldChangeSigner,
  });
  const {
    write,
    isSuccess: submitted,
    isLoading: isSubmitting,
  } = useContractWrite(writeConfig);

  return (
    <div style={{ display: "grid", justifyContent: "center" }}>
      <h3>Update your mood index</h3>
      {!submissionArgs && !isPreparingSubmission && (
        <p>On a scale of 0 to 255, how do you feel?</p>
      )}
      <div style={{ display: "flex", gap: 20 }}>
        {!submissionArgs && !isPreparingSubmission && (
          <>
            <input
              type="range"
              min={0}
              max={255}
              value={moodIndex}
              onChange={(e) => setMoodIndex(Number(e.target.value))}
            />
            <div>{moodIndex}</div>
            <button onClick={prepareSubmission}>Prepare submission</button>
          </>
        )}
        {write && !isSubmitting && !submitted && (
          <button onClick={() => write()}>Submit</button>
        )}
      </div>
      {(prepareConfigIsLoading || isPreparingSubmission) && (
        <p>Preparing submission...</p>
      )}
      {prepareSubmissionError && (
        <p>Error: {prepareSubmissionError.message.toString()}</p>
      )}
      {submissionArgs && prepareConfigHasError && <p>Preparation error</p>}
      {shouldChangeSigner && (
        <p>
          Switch wallets before submitting to avoid doxing your identity.
          (Choose a wallet that you don't use anywhere else.)
        </p>
      )}
      {isSubmitting && <p>Submitting...</p>}
      {submitted && <p>Submitted</p>}
    </div>
  );
}
