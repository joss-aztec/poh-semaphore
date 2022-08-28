import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-waffle";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import "./tasks/accounts";
import "./tasks/deploy-nullifier-consistency-verifier";
import "./tasks/deploy-poh-semaphore";
import { NetworksUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

function getNetworks(): NetworksUserConfig | undefined {
  if (process.env.INFURA_API_KEY && process.env.BACKEND_PRIVATE_KEY) {
    const infuraApiKey = process.env.INFURA_API_KEY;
    const accounts = [`0x${process.env.BACKEND_PRIVATE_KEY}`];

    return {
      kovan: {
        url: `https://kovan.infura.io/v3/${infuraApiKey}`,
        chainId: 42,
        accounts,
      },
      goerli: {
        url: `https://goerli.infura.io/v3/${infuraApiKey}`,
        chainId: 5,
        accounts,
      },
    };
  }
}

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    localhost: {
      url: `http://localhost:8545`,
      chainId: 1337,
    },
    ...getNetworks(),
  },
};

export default config;
