import PohSemaphoreRegistration from "./PohSemaphoreRegistration";
import usePohIsRegistered from "./usePohIsRegistered";

function PohRegistrationFound(props: { address: string }) {
  return (
    <div>
      <h2>Proof of Humanity Registration</h2>
      <p>This account is registered on the Proof of Humanity Protocol.</p>
      <PohSemaphoreRegistration address={props.address} />
    </div>
  );
}

function PohRegistrationNotFound() {
  return (
    <p>
      This ethereum address has no active registration on the Proof of Humanity
      Protocol. Please first go to their{" "}
      <a
        href="https://goerli.etherscan.io/address/0xd8c0c93c1f55a208c093c7141bde2d251072b623#writeContract"
        target="_blank"
        rel="noopener noreferrer"
      >
        dapp
      </a>{" "}
      and submit an application for review.
    </p>
  );
}
export default function PohRegistration(props: { address: string }) {
  const { data: isRegisteredOnPoh, isLoading } = usePohIsRegistered(
    props.address
  );
  if (isLoading) return <>Loading...</>;
  if (isRegisteredOnPoh) {
    return <PohRegistrationFound address={props.address} />;
  }
  return <PohRegistrationNotFound />;
}
