# Proof of Humanity Semaphore

A wrapper around the Proof of Humanity Protocol and Semaphore protocol for enabling anonymous sybil-proof services.

### Deployments

#### Goerli

[ProofOfHumanitySemaphore](https://goerli.etherscan.io/address/0x009112E0B79d8fb40e623d3B79b4CfdA2d493fbF)

[NullifierConsistencyVerifier](https://goerli.etherscan.io/address/0x26D3a8c7254f0Ce06f3417d30b2753e4CC3fCD4f)

#### Kovan

[ProofOfHumanitySemaphore](https://kovan.etherscan.io/address/0x3734638e20Ed2CCA1B99A73ffC7d37c966066EFE)

[NullifierConsistencyVerifier](https://kovan.etherscan.io/address/0x320F890B1D5298f338E292dF3Cea6d748C26E988)

## Development

Install dependencies

```
yarn
```

Build circuit and verifier contract

```
. scripts/compile.circuit.sh
```

Build and test contract and circuit

```
npx hardhat test
```
