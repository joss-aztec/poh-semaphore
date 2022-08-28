// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../interfaces/IProofOfHumanitySemaphore.sol";

contract AnonMoodIndex {
    error AnonMoodIndex__BadMoodIndexHash();
    error AnonMoodIndex__WrongService();

    struct UserState {
        uint256 userId;
        uint256 moodIndex;
    }

    // sha256("AnonMoodIndex") % SNARK_SCALAR_FIELD
    uint256 SERVICE_NULLIFIER =
        12315073238614743171130421319756885229829054153875578765237798620015051182345;

    IProofOfHumanitySemaphore proofOfHumanitySemaphore;
    UserState[] public userStates;

    constructor(IProofOfHumanitySemaphore _proofOfHumanitySemaphore) {
        proofOfHumanitySemaphore = _proofOfHumanitySemaphore;
    }

    function averageMoodIndex() external view returns (uint8) {
        uint256 total;
        for (uint256 i = 0; i < userStates.length; i++) {
            total += userStates[i].moodIndex;
        }
        return uint8(total / userStates.length);
    }

    function userExists(uint256 userId) external view returns (bool) {
        for (uint256 i = 0; i < userStates.length; i++) {
            if (userStates[i].userId == userId) {
                return true;
            }
        }
        return false;
    }

    function userMoodIndex(uint256 userId) external view returns (uint256) {
        for (uint256 i = 0; i < userStates.length; i++) {
            if (userStates[i].userId == userId) {
                return userStates[i].moodIndex;
            }
        }
        return 0;
    }

    function updateMoodIndexVerifiably(
        uint8 moodIndex,
        bytes32 moodIndexHashSignal,
        uint256 nullifierHash,
        uint256 serviceNullifier,
        uint256 externalNullifier,
        uint256 identityProxy,
        uint256[8] calldata nullifierConsistencyProof,
        uint256[8] calldata semaphoreProof
    ) external {
        proofOfHumanitySemaphore.verifyProof(
            moodIndexHashSignal,
            nullifierHash,
            serviceNullifier,
            externalNullifier,
            identityProxy,
            nullifierConsistencyProof,
            semaphoreProof
        );
        if (serviceNullifier != SERVICE_NULLIFIER) {
            revert AnonMoodIndex__WrongService();
        }
        if (moodIndexHashSignal != keccak256(abi.encodePacked(moodIndex))) {
            revert AnonMoodIndex__BadMoodIndexHash();
        }
        updateMoodIndex(identityProxy, moodIndex);
    }

    function updateMoodIndex(uint256 userId, uint8 moodIndex) private {
        for (uint256 i = 0; i < userStates.length; i++) {
            if (userStates[i].userId == userId) {
                userStates[i].moodIndex = moodIndex;
                return;
            }
        }
        UserState memory userState;
        userState.userId = userId;
        userState.moodIndex = moodIndex;
        userStates.push(userState);
    }
}
