import usePohIsRegistered from "./usePohIsRegistered";
import { useContractRead } from "wagmi";
import { contractAddresses } from "./contract_addresses";
import { pohSemaphore } from "./abi/poh_semaphore";
import { DeregisterMember } from "./DeregisterMember";

const POH_SEMAPHORE_IDENTITY_COMMITMENT = {
  addressOrName: contractAddresses.goerli.pohSemaphore,
  contractInterface: pohSemaphore.abi,
  functionName: "identityCommitmentToAddress",
};

export function GroupMember(props: { identityCommitment: string }) {
  const { data: addressResult } = useContractRead({
    ...POH_SEMAPHORE_IDENTITY_COMMITMENT,
    args: [props.identityCommitment],
    watch: true,
  });
  const address = addressResult as string | undefined;
  const {
    data: isRegisteredOnPohResult,
    isLoading: isLoadingIsRegisteredOnPoh,
  } = usePohIsRegistered(address);
  const isRegisteredOnPoh = isRegisteredOnPohResult as boolean | undefined;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <div style={{ wordBreak: "break-all", width: 300 }}>
        Identity commitment: {props.identityCommitment}
      </div>
      <div>Address: {address ?? "Loading..."}</div>
      <div>
        PoH registration active:{" "}
        {isLoadingIsRegisteredOnPoh
          ? "Loading..."
          : isRegisteredOnPoh?.toString()}
      </div>
      {isRegisteredOnPoh === false && address && (
        <DeregisterMember
          identityCommitment={props.identityCommitment}
          address={address}
        />
      )}
    </div>
  );
}
