export const anonMoodIndex = {
  contractName: "AnonMoodIndex",
  abi: [
    {
      inputs: [
        {
          internalType: "contract IProofOfHumanitySemaphore",
          name: "_proofOfHumanitySemaphore",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "AnonMoodIndex__BadMoodIndexHash",
      type: "error",
    },
    {
      inputs: [],
      name: "averageMoodIndex",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint8",
          name: "moodIndex",
          type: "uint8",
        },
        {
          internalType: "bytes32",
          name: "moodIndexHashSignal",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "nullifierHash",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "serviceNullifier",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "externalNullifier",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "identityProxy",
          type: "uint256",
        },
        {
          internalType: "uint256[8]",
          name: "nullifierConsistencyProof",
          type: "uint256[8]",
        },
        {
          internalType: "uint256[8]",
          name: "semaphoreProof",
          type: "uint256[8]",
        },
      ],
      name: "updateMoodIndexVerifiably",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "userId",
          type: "uint256",
        },
      ],
      name: "userExists",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "userId",
          type: "uint256",
        },
      ],
      name: "userMoodIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "userStates",
      outputs: [
        {
          internalType: "uint256",
          name: "userId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "moodIndex",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
