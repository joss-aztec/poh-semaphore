import { Contract } from "ethers";
import { task, types } from "hardhat/config";

task("deploy:anon-mood-index", "Deploy AnonMoodIndex contract")
  .addParam(
    "pohs",
    "Address of ProofOfHumanitySemaphore contract",
    undefined,
    types.string
  )
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async (args, { ethers }): Promise<Contract> => {
    const pohSemaphoreAddress = args.pohs;

    const AnonMoodIndex = await ethers.getContractFactory("AnonMoodIndex");

    const anonMoodIndex = await AnonMoodIndex.deploy(pohSemaphoreAddress);

    await anonMoodIndex.deployed();

    if (args.logs) {
      console.log(
        `AnonMoodIndex contract has been deployed to: ${anonMoodIndex.address}`
      );
    }

    return anonMoodIndex;
  });
