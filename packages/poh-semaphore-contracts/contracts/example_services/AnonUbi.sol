// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../interfaces/IProofOfHumanitySemaphore.sol";

contract AnonUbi {
    error AnonUbi__WrongService();

    // sha256("AnonUbi") % SNARK_FIELD_SIZE
    uint256 constant SERVICE_NULLIFIER =
        2599749192553526744101485407855232264006280871422148661884192113239190147728;

    IProofOfHumanitySemaphore proofOfHumanitySemaphore;
    mapping(uint256 => uint256) public lastClaimDateByUser;
    mapping(address => uint256) public balanceByAddress;

    constructor(IProofOfHumanitySemaphore _proofOfHumanitySemaphore) {
        proofOfHumanitySemaphore = _proofOfHumanitySemaphore;
    }

    function claimUbiVerifiably(
        bytes32 signal,
        uint256 nullifierHash,
        uint256 serviceNullifier,
        uint256 externalNullifier,
        uint256 identityProxy,
        uint256[8] calldata nullifierConsistencyProof,
        uint256[8] calldata semaphoreProof
    ) external {
        proofOfHumanitySemaphore.verifyProof(
            signal,
            nullifierHash,
            serviceNullifier,
            externalNullifier,
            identityProxy,
            nullifierConsistencyProof,
            semaphoreProof
        );
        if (serviceNullifier != SERVICE_NULLIFIER) {
            revert AnonUbi__WrongService();
        }
        address recipient = address(bytes20(signal));
        claimUbi(identityProxy, recipient);
    }

    function claimAllowance(uint256 userId) public view returns (uint256) {
        uint256 lastClaimDate = lastClaimDateByUser[userId];
        if (lastClaimDate == 0) {
            // Never claimed before - grant one token
            return 1e18;
        }
        // Otherwise allow one token per day
        return (1e18 * (block.timestamp - lastClaimDate)) / (60 * 60 * 24);
    }

    function claimUbi(uint256 userId, address recipient) private {
        balanceByAddress[recipient] += claimAllowance(userId);
        lastClaimDateByUser[userId] = block.timestamp;
    }
}
