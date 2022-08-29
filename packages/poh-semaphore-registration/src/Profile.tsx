import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import PohRegistration from "./PohRegistration";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const showRegistration = address && isConnected;
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 100,
      }}
    >
      <ConnectButton />
      {showRegistration && <PohRegistration address={address} />}
    </div>
  );
}
