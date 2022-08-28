import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "ethers";
import { task, types } from "hardhat/config";

task("deploy:poh-semaphore", "Deploy ProofOfHumanitySemaphore contract")
  .addParam(
    "poh",
    "Address of Proof of Humanity contract",
    undefined,
    types.string
  )
  .addParam(
    "semaphore",
    "Address of Semaphore Protocol contract",
    undefined,
    types.string
  )
  .addParam(
    "verifier",
    "Address of NullifierConsistencyVerifier contract",
    undefined,
    types.string
  )
  .addParam(
    "group",
    "The group ID to register inside Semaphore",
    undefined,
    types.string
  )
  .addOptionalParam<number>(
    "depth",
    "Tree depth",
    Number(process.env.TREE_DEPTH) || 20,
    types.int
  )
  .addOptionalParam<number>(
    "incentive",
    "Reward to prover for deregistering",
    0.01e18,
    types.int
  )
  .addOptionalParam<string>(
    "zero",
    "Default value of empty group tree leaf",
    "0",
    types.string
  )
  .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
  .setAction(async (args, { ethers }): Promise<Contract> => {
    const pohAddress = args["poh"];
    const semaphoreAddress = args["semaphore"];
    const nullifierConsistencyVerifierAddress = args["verifier"];
    const semaphoreGroupId = args["group"];
    const depth = args["depth"];
    const deregisterIncentive = args["incentive"];
    const zeroValue = BigInt(args["zero"]);
    const logs = args["logs"];

    const PohSemaphore = await ethers.getContractFactory(
      "ProofOfHumanitySemaphore"
    );

    const pohSemaphore = await PohSemaphore.deploy(
      BigInt(deregisterIncentive),
      pohAddress,
      semaphoreAddress,
      nullifierConsistencyVerifierAddress,
      semaphoreGroupId
    );

    await pohSemaphore.deployed();

    if (logs) {
      console.log(
        `ProofOfHumanitySemaphore contract has been deployed to: ${pohSemaphore.address}`
      );
    }

    const accounts: Signer[] = await ethers.getSigners();
    await pohSemaphore.connect(accounts[0]).initGroup(depth, zeroValue);

    if (logs) {
      console.log(
        `ProofOfHumanitySemaphore contract semaphore group '${semaphoreGroupId}' created.`
      );
    }

    return pohSemaphore;
  });
