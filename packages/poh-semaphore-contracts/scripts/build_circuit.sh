#!/bin/bash

cd circuits
mkdir build
cd build

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling NullifierConsistency.circom..."

# compile circuit

cd ..

circom NullifierConsistency.circom --r1cs --wasm --sym -o build
snarkjs r1cs info build/NullifierConsistency.r1cs

# Start a new zkey and make a contribution

snarkjs groth16 setup build/NullifierConsistency.r1cs build/powersOfTau28_hez_final_10.ptau build/circuit_0000.zkey
snarkjs zkey contribute build/circuit_0000.zkey build/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey build/circuit_final.zkey build/verification_key.json

# generate solidity contract
VERIFIER_SRC="../contracts/NullifierConsistencyVerifier.sol"
snarkjs zkey export solidityverifier build/circuit_final.zkey $VERIFIER_SRC
{ rm $VERIFIER_SRC && awk '{gsub("pragma solidity \\^0.6.11", "pragma solidity ^0.8.9", $0); print}'  > $VERIFIER_SRC; } < $VERIFIER_SRC
{ rm $VERIFIER_SRC && awk '{gsub("contract Verifier", "contract NullifierConsistencyVerifier", $0); print}'  > $VERIFIER_SRC; } < $VERIFIER_SRC
cd ..