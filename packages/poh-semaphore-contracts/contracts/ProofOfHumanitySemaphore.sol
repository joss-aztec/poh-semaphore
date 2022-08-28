// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "./interfaces/IProofOfHumanitySemaphore.sol";
import "./interfaces/IProofOfHumanity.sol";
import "./interfaces/ISemaphore.sol";
import "./interfaces/IVerifier.sol";

contract ProofOfHumanitySemaphore is IProofOfHumanitySemaphore {
    uint256 deregisteringIncentive;
    IProofOfHumanity proofOfHumanity;
    ISemaphore semaphore;
    IVerifier nullifierConsistencyVerifier;
    uint256 public semaphoreGroupId;
    mapping(address => uint256) public addressToIdentityCommitment;
    mapping(uint256 => address) public identityCommitmentToAddress; // TODO: Remove once mapping is available via The Graph

    constructor(
        uint256 _deregisteringIncentive,
        IProofOfHumanity _proofOfHumanity,
        ISemaphore _semaphore,
        IVerifier _nullifierConsistencyVerifier,
        uint256 _semaphoreGroupId
    ) {
        deregisteringIncentive = _deregisteringIncentive;
        proofOfHumanity = _proofOfHumanity;
        semaphore = _semaphore;
        nullifierConsistencyVerifier = _nullifierConsistencyVerifier;
        semaphoreGroupId = _semaphoreGroupId;
    }

    function initGroup(uint8 groupDepth, uint256 zeroValue) external {
        address admin = address(this);
        semaphore.createGroup(semaphoreGroupId, groupDepth, zeroValue, admin);
    }

    function registerIdentityCommitment(uint256 identityCommitment)
        external
        payable
    {
        address submissionId = msg.sender;
        if (addressToIdentityCommitment[submissionId] != 0) {
            revert ProofOfHumanitySemaphore__AlreadyRegistered();
        }
        if (!proofOfHumanity.isRegistered(submissionId)) {
            revert ProofOfHumanitySemaphore__CallerIsNotRegistered();
        }
        if (msg.value != deregisteringIncentive) {
            revert ProofOfHumanitySemaphore__IncorrectPayment();
        }
        semaphore.addMember(semaphoreGroupId, identityCommitment);
        addressToIdentityCommitment[submissionId] = identityCommitment;
        identityCommitmentToAddress[identityCommitment] = submissionId;
        emit IdentityCommitmentRegistered(submissionId, identityCommitment);
    }

    function deregisterIdentityCommitment(
        address submissionId,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external {
        if (addressToIdentityCommitment[submissionId] == 0) {
            revert ProofOfHumanitySemaphore__RegistrationNotFound();
        }
        if (proofOfHumanity.isRegistered(submissionId)) {
            revert ProofOfHumanitySemaphore__RegistrationStillValid();
        }
        uint256 identityCommitment = addressToIdentityCommitment[submissionId];
        semaphore.removeMember(
            semaphoreGroupId,
            identityCommitment,
            proofSiblings,
            proofPathIndices
        );
        addressToIdentityCommitment[submissionId] = 0;
        identityCommitmentToAddress[identityCommitment] = address(0);
        bool sent = payable(msg.sender).send(deregisteringIncentive);
        if (!sent) {
            revert ProofOfHumanitySemaphore__PaymentFailed();
        }
    }

    function verifyProof(
        bytes32 signal,
        uint256 nullifierHash,
        uint256 serviceNullifier,
        uint256 externalNullifier,
        uint256 identityProxy,
        uint256[8] calldata nullifierConsistencyProof,
        uint256[8] calldata semaphoreProof
    ) external {
        bool isConsistent = verifyNullifierConsistencyProof(
            serviceNullifier,
            identityProxy,
            externalNullifier,
            nullifierHash,
            nullifierConsistencyProof
        );
        if (!isConsistent) {
            revert ProofOfHumanitySemaphore__InconsistentNullifiers();
        }
        semaphore.verifyProof(
            semaphoreGroupId,
            signal,
            nullifierHash,
            externalNullifier,
            semaphoreProof
        );
        emit ProofVerified(
            signal,
            nullifierHash,
            serviceNullifier,
            externalNullifier,
            identityProxy
        );
    }

    function verifyNullifierConsistencyProof(
        uint256 serviceNullifier,
        uint256 identityProxy,
        uint256 externalNullifier,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) private view returns (bool) {
        return
            nullifierConsistencyVerifier.verifyProof(
                [proof[0], proof[1]],
                [[proof[2], proof[3]], [proof[4], proof[5]]],
                [proof[6], proof[7]],
                [
                    serviceNullifier,
                    identityProxy,
                    externalNullifier,
                    nullifierHash
                ]
            );
    }
}
