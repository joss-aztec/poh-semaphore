import { useContractRead } from "wagmi";
import { contractAddresses } from "./contract_addresses";
import { poh } from "./abi/poh";

const POH_IS_REGISTERED = {
  addressOrName: contractAddresses.goerli.poh,
  contractInterface: poh.abi,
  functionName: "isRegistered",
};

export default function usePohIsRegistered(address?: string) {
  return useContractRead({
    ...POH_IS_REGISTERED,
    args: [address],
    enabled: !!address,
    watch: true,
  });
}
