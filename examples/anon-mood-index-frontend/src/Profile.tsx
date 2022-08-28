import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSignMessage } from "wagmi";
import { useState } from "react";
import MoodIndex from "./MoodIndex";
import {
  generateIdentityProxy,
  INDENTITY_SIGNING_MESSAGE,
} from "poh-semaphore-client";
import { ANON_MOOD_INDEX_SERVICE_NULLIFIER } from "./server_nullifier";

export default function Profile() {
  const { signMessageAsync } = useSignMessage({
    message: INDENTITY_SIGNING_MESSAGE,
  });
  const [userId, setUserId] = useState<string>();

  const handleDerive = async () => {
    const signedMessage = await signMessageAsync();
    const identityProxy = await generateIdentityProxy(
      ANON_MOOD_INDEX_SERVICE_NULLIFIER,
      signedMessage
    );
    setUserId(identityProxy);
  };
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 100,
        justifyContent: "center",
      }}
    >
      <h2>Profile</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <ConnectButton />
        <button onClick={handleDerive}>Regenerate User ID</button>
      </div>

      {userId && (
        <p style={{ width: "100%", wordBreak: "break-all" }}>
          Anon Mood Index User ID: {userId}
        </p>
      )}
      {userId && <MoodIndex userId={userId} />}
    </div>
  );
}
