import "@rainbow-me/rainbowkit/dist/index.css";
import {
  RainbowKitProvider,
  wallet,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig, chain } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import React from "react";

const { chains, provider, webSocketProvider } = configureChains(
  [chain.goerli],
  [
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_API_KEY }),
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  { groupName: "Supported", wallets: [wallet.metaMask({ chains })] },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export default function RainbowAndWagmiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
}
