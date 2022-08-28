import { Contract } from "ethers";
import { task, types } from "hardhat/config";

task(
  "deploy:nullifier-consistency-verifier",
  "Deploy NullifierConsistencyVerifier contract"
)
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async ({ logs }, { ethers }): Promise<Contract> => {
    const NullifierConsistency = await ethers.getContractFactory(
      `NullifierConsistencyVerifier`
    );

    const nullifierConsistency = await NullifierConsistency.deploy();

    await nullifierConsistency.deployed();

    if (logs) {
      console.log(
        `NullifierConsistencyVerifier contract has been deployed to: ${nullifierConsistency.address}`
      );
    }

    return nullifierConsistency;
  });
