import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import {
  IProofOfHumanity__factory,
  ISemaphore__factory,
} from "../typechain-types";
// @ts-ignore
import { groth16 } from "snarkjs";

const { deployMockContract } = waffle;

interface NullifierConsistencyProofInput {
  serviceNullifier: string;
  privIdentityNullifier: string;
  privRandomNonce: string;
  identityProxy: string;
  externalNullifier: string;
  nullifierHash: string;
}

async function proveNullifierConsistency(
  input: NullifierConsistencyProofInput
) {
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    "circuits/build/NullifierConsistency_js/NullifierConsistency.wasm",
    "circuits/build/circuit_final.zkey"
  );
  const calldataStr: string = await groth16.exportSolidityCallData(
    proof,
    publicSignals
  );
  const calldata = calldataStr
    .replace(/[\[\]\"]/g, "")
    .split(",")
    .slice(0, 8)
    .map((x) => BigInt(x));
  return calldata;
}

describe("ProofOfHumanitySemaphore", () => {
  async function deployContracts() {
    const [owner, otherAccount] = await ethers.getSigners();

    const pohMock = await deployMockContract(
      owner,
      IProofOfHumanity__factory.abi
    );
    const semaphoreMock = await deployMockContract(
      owner,
      ISemaphore__factory.abi
    );

    const ProofOfHumanitySemaphore = await ethers.getContractFactory(
      "ProofOfHumanitySemaphore"
    );

    const DEREGISTER_INCENTIVE = 10n ** 16n;
    const SEMAPHORE_GROUP_ID = 0;
    const GROUP_DEPTH = 20;
    const ZERO_VALUE = 0;

    const NullifierConsistencyVerifier = await ethers.getContractFactory(
      "NullifierConsistencyVerifier"
    );
    const nullifierConsistencyVerifier =
      await NullifierConsistencyVerifier.deploy();

    const pohSemaphore = await ProofOfHumanitySemaphore.deploy(
      DEREGISTER_INCENTIVE,
      pohMock.address,
      semaphoreMock.address,
      nullifierConsistencyVerifier.address,
      SEMAPHORE_GROUP_ID
    );
    await semaphoreMock.mock.createGroup
      .withArgs(
        SEMAPHORE_GROUP_ID,
        GROUP_DEPTH,
        ZERO_VALUE,
        pohSemaphore.address
      )
      .returns();
    await pohSemaphore.connect(owner).initGroup(GROUP_DEPTH, ZERO_VALUE);
    return {
      pohMock,
      semaphoreMock,
      pohSemaphore,
      owner,
      otherAccount,
      DEREGISTER_INCENTIVE,
      SEMAPHORE_GROUP_ID,
    };
  }

  describe("Identity commitment registration", () => {
    it("Should revert for a user without a PoH registration", async function () {
      const { pohMock, pohSemaphore, otherAccount } = await loadFixture(
        deployContracts
      );

      await pohMock.mock.isRegistered.returns(false);
      await expect(
        pohSemaphore.connect(otherAccount).registerIdentityCommitment(0)
      ).to.be.revertedWith("ProofOfHumanitySemaphore__CallerIsNotRegistered()");
    });

    it("Should refuse an underpaid registration", async () => {
      const {
        pohMock,
        semaphoreMock,
        pohSemaphore,
        otherAccount,
        SEMAPHORE_GROUP_ID,
        DEREGISTER_INCENTIVE,
      } = await loadFixture(deployContracts);
      const identityCommitment = 0;
      await pohMock.mock.isRegistered
        .withArgs(otherAccount.address)
        .returns(true);
      await semaphoreMock.mock.addMember
        .withArgs(SEMAPHORE_GROUP_ID, identityCommitment)
        .returns();
      await expect(
        pohSemaphore
          .connect(otherAccount)
          .registerIdentityCommitment(identityCommitment, {
            value: DEREGISTER_INCENTIVE / 2n,
          })
      ).to.be.revertedWith("ProofOfHumanitySemaphore__IncorrectPayment()");
    });

    it("Should accept a valid registration registration", async () => {
      const {
        pohMock,
        semaphoreMock,
        pohSemaphore,
        otherAccount,
        SEMAPHORE_GROUP_ID,
        DEREGISTER_INCENTIVE,
      } = await loadFixture(deployContracts);
      const identityCommitment = 0;
      await pohMock.mock.isRegistered
        .withArgs(otherAccount.address)
        .returns(true);
      await semaphoreMock.mock.addMember
        .withArgs(SEMAPHORE_GROUP_ID, identityCommitment)
        .returns();
      await expect(
        pohSemaphore
          .connect(otherAccount)
          .registerIdentityCommitment(identityCommitment, {
            value: DEREGISTER_INCENTIVE,
          })
      )
        .to.emit(pohSemaphore, "IdentityCommitmentRegistered")
        .withArgs(otherAccount.address, identityCommitment);
    });
  });

  describe("Verification", () => {
    it("Should accept a valid proof pair", async () => {
      const { semaphoreMock, pohSemaphore, otherAccount, SEMAPHORE_GROUP_ID } =
        await loadFixture(deployContracts);

      const proofInput = {
        serviceNullifier: "3",
        privIdentityNullifier: "5",
        privRandomNonce: "7",
        identityProxy:
          "6785167652243325121502926540806452447443769108715415059349984576933636058888",
        externalNullifier:
          "10792109105659780501987979115125331313096686856714552667482248749787479314463",
        nullifierHash:
          "3979622137768783141887791456593217384977806412753183222556124011872149109142",
      };
      const nullifierConsistencyProofCalldata = await proveNullifierConsistency(
        proofInput
      );
      const semaphoreProofCalldata = [0, 0, 0, 0, 0, 0, 0, 0];
      const signal = ethers.utils.formatBytes32String("Hello World");
      await semaphoreMock.mock.verifyProof
        .withArgs(
          SEMAPHORE_GROUP_ID,
          signal,
          proofInput.nullifierHash,
          proofInput.externalNullifier,
          semaphoreProofCalldata
        )
        .returns();
      const transaction = pohSemaphore
        .connect(otherAccount)
        .verifyProof(
          signal,
          proofInput.nullifierHash,
          proofInput.serviceNullifier,
          proofInput.externalNullifier,
          proofInput.identityProxy,
          nullifierConsistencyProofCalldata,
          semaphoreProofCalldata
        );
      await expect(transaction)
        .to.emit(pohSemaphore, "ProofVerified")
        .withArgs(
          signal,
          proofInput.nullifierHash,
          proofInput.serviceNullifier,
          proofInput.externalNullifier,
          proofInput.identityProxy
        );
    });

    it("Should revert for inconsistent nullifiers", async () => {
      const { semaphoreMock, pohSemaphore, otherAccount, SEMAPHORE_GROUP_ID } =
        await loadFixture(deployContracts);

      const proofInput = {
        serviceNullifier: "3",
        privIdentityNullifier: "5",
        privRandomNonce: "7",
        identityProxy:
          "6785167652243325121502926540806452447443769108715415059349984576933636058888",
        externalNullifier:
          "10792109105659780501987979115125331313096686856714552667482248749787479314463",
        nullifierHash:
          "3979622137768783141887791456593217384977806412753183222556124011872149109142",
      };
      const nullifierConsistencyProofCalldata = await proveNullifierConsistency(
        proofInput
      );
      const semaphoreProofCalldata = [0, 0, 0, 0, 0, 0, 0, 0];
      const signal = ethers.utils.formatBytes32String("Hello World");
      const inconsistentIdentityProxy = "0";
      await semaphoreMock.mock.verifyProof
        .withArgs(
          SEMAPHORE_GROUP_ID,
          signal,
          proofInput.nullifierHash,
          proofInput.externalNullifier,
          semaphoreProofCalldata
        )
        .returns();
      const transaction = pohSemaphore
        .connect(otherAccount)
        .verifyProof(
          signal,
          proofInput.nullifierHash,
          proofInput.serviceNullifier,
          proofInput.externalNullifier,
          inconsistentIdentityProxy,
          nullifierConsistencyProofCalldata,
          semaphoreProofCalldata
        );
      await expect(transaction).to.be.revertedWith(
        "ProofOfHumanitySemaphore__InconsistentNullifiers()"
      );
    });
  });
});
