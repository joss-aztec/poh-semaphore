import { useContractRead } from "wagmi";
import { contractAddresses } from "./contract_addresses";
import { pohSemaphore } from "./abi/poh_semaphore";
import RegisterIdentityCommitment from "./RegisterIdentityCommitment";

const POH_SEMAPHORE_IDENTITY_COMMITMENT = {
  addressOrName: contractAddresses.goerli.pohSemaphore,
  contractInterface: pohSemaphore.abi,
  functionName: "addressToIdentityCommitment",
};

export default function PohSemaphoreRegistration(props: { address: string }) {
  const { data: idenitityCommitmentBigNum, isLoading } = useContractRead({
    ...POH_SEMAPHORE_IDENTITY_COMMITMENT,
    args: [props.address],
    watch: true,
  });
  const identityCommitment: bigint | undefined =
    idenitityCommitmentBigNum?.toBigInt();

  return (
    <div>
      <>
        <h3>PoH Semaphore Registration</h3>
        {isLoading && <p>Checking for a registered identity commitment...</p>}
        {!isLoading && identityCommitment && (
          <p>
            You have a registered identity commitment on Proof of Humanity
            Semaphore.
          </p>
        )}
        {!isLoading && !identityCommitment && (
          <RegisterIdentityCommitment address={props.address} />
        )}
      </>
    </div>
  );
}
