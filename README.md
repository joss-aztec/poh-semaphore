# Poof of Humanity (PoH) Semaphore

## Overview

PoH Semaphore is a ZKP-based protocol for allowing dApp developers to build on top of the Proof of Humanity Protocol (PoHP) in a manner that doesn't link a user's activity to their identity.

If a user has a valid registration on PoHP attesting their personhood, they are permitted to register an identity commitment via the PoH Semaphore contract. Following this, a user can then interact with any services that support PoH Semaphore whilst using any Ethereum account of their choosing. (Best practice would be to maintain separate wallets for each service.)

Any services built on PoH Semaphore can reason about the activity of individual anonymous humans by tracing a user's identity proxy, which is a value generated by a user such that it is specific to them and the service that they are using, without revealing a link to their identity commitment or their address within PoHP.

### How it works

This project is built on the Semaphore Protocol and thus the following explanation assumes an understanding of it.

The Semaphore Protocol is designed for complete anonymity when sending signals, which makes it inconvenient for dApps that wish to reason about the activity of individuals in a verifiable manner. PoH Semaphore addresses this problem with an auxiliary ZKP, that publicly exposes a user's identity proxy, which is verifiably unique to the user that produced the semaphore signal proof counterpart.

The circuit that enforces this relationship is [`NullifierConsistency.circom`](packages/poh-semaphore-contracts/circuits/NullifierConsistency.circom). The diagram below highlights the values introduced by this circuit. The constraints of this circuit include the highlighted region and also the regeneration of the nullifier hash.

![Circuit extension diagram](circuit_extension.png)

The identity proxy is formed by hashing two inputs: the service nullifier - which is declared and checked by the service in question - and the user's identity nullifier.

The external nullifier is then derived by hashing the user's identity proxy with a random value.

The circuit uses the same derivation of the nullifier hash as found in the [`semaphore.circom`](https://github.com/semaphore-protocol/semaphore/blob/main/circuits/semaphore.circom), i.e. by hashing the external nullifier with the identity nullifier. Because the external nullifier has been constrained to use the identity nullifier as an input, we are able to ensure that the same identity nullifier has been used as input to both circuits. If this were not the case, the prover could freely select any value for the identity, regardless of whether it had a commitment in the group.

Note: Currently this circuit is unintentionally doing redundant work. There is no benefit in constraining the external nullifier to be derived in this way, and it could instead directly take on the role of the random nonce. Furthermore, it would be beneficial in a future iteration to merge the circuits into a single bespoke circuit so as to reduce verification gas costs. This would involve departing from Semaphore Protocol's stack, so involves significant work.

## For service developers

### Integrating PoH Semaphore into services

- Contract src: [`ProofOfHumanitySemaphore.sol`](/packages/poh-semaphore-contracts/contracts/ProofOfHumanitySemaphore.sol)
- Contract deployment: [`0xD40588C85FeC35B7d9E437CE86CA64c035cBE4FC (goerli)`](https://goerli.etherscan.io/address/0xD40588C85FeC35B7d9E437CE86CA64c035cBE4FC)
- Client tools src: [`packages/poh-semaphore-client`](packages/poh-semaphore-client)
- Client tools npm: TODO

Any service intending to build on PoH Semaphore (and its existing pool of registrations) needs to makes changes on both their contract and their frontend.

#### Contract integration

Anonymous user actions should call PoH Semaphore's `verifyProof` method with proof information produced by the interacting user. Each proof is disposable, so the user will have to generate this information for every interaction. Furthermore the service should also declare a service nullifier, and test that the `serviceNullifier` forwarded to `verifyProof` is consistent with the service. Your service nullifier can be any unique snark field element, such as the hash of the name of your service.

**IMPORTANT**: If a service contract has more than one ingress for user interactions, then an attack is possible in which an intercepted proof could be redirected to a different method. A user's intent should be fully encoded into the proof so it can't be tampered, and then evaluated at one ingress on the service contract.

#### Frontend integration

Since a user's presence within a service is represented by their identity proxy, the user will first have to regenerate their identity proxy in order to query any related data. This is done by signing over `poh-semaphore-client`'s `IDENTITY_SIGNING_MESSAGE`, and passing the result into `generateIdentityProxy`.

For performing contract interactions the user will first have to produce a semaphore & nullifier consistency proof pair that encodes their desired message. This again requires a signature over `IDENTITY_SIGNING_MESSAGE`, which is then passed alongside the service nullifier and the desired signal into `poh-semaphore-client`'s `generateProofPair` function.

**IMPORTANT**: Before submitting the resulting proof information, the user should be prompted to switch wallets. If a user were to submit their interaction using the same signer that they used to regenerate their identity, then the user's identity would be doxed and the whole exercise rendered pointless.

## For user management

### PoH Semaphore (De)Registration Frontend

- src: [`packages/poh-semaphore-registration`](packages/poh-semaphore-registration)
- deployment: [`(goerli)`](https://main--magenta-tartufo-4e4c09.netlify.app/)

With this rudimentary frontend, a user can generate and register an identity commitment to be associated with their existing PoHP registration. While doing this the user also deposits a fee, which exists to later incentivise the deregistration of the user's identity commitment should their PoHP attestation expire or be challenged.

If the user does not have a valid registration, they will be unable to register an identity commitment. Furthermore, if they have an existing identity commitment registration, it is publicly listed for removal, and their original deposit becomes fair game. Anybody can claim this reward by using the UI to generate a proof for deregistering the user that's due for removal. (For improved deregistration punctuality, I'd propose developing a server that monitors for and processes these opportunities. Doing so would also reduce the need for a high value incentive deposit.)

This current UI is clunky and serves mainly as a convenience for interacting with the PoH Semaphore contract. Ideally the identity commitment registration interaction would be directly integrated into PoHP's own frontend. (Without first-party promotion, PoH Semaphore likely won't achieve adequate registrations, making the privacy proposition limited.)

## Example services

### Anon Mood Index

- Contract src: [`AnonMoodIndex.sol`](packages/poh-semaphore-contracts/contracts/example_services/AnonMoodIndex.sol)
- Contract deployment: [`0x0137478F6E112410C5aB917A05805DB4923440E1 (goerli)`](https://goerli.etherscan.io/address/0x0137478F6E112410C5aB917A05805DB4923440E1)
- Fontend src: [`examples/anon-mood-index-frontend`](examples/anon-mood-index-frontend)
- Frontend deployment: [`(goerli)`](https://zingy-blancmange-116a3f.netlify.app/)

A trite example of how being able to track the activity of anonymous individuals is important for state aggregation. If it were not possible to track the participants, then any user could corrupt the average mood index by repeatedly submitting a value that they wanted the average to move towards.

### Anon UBI

- Contract src: [`AnonUbi.sol`](packages/poh-semaphore-contracts/contracts/example_services/AnonUbi.sol)
- Contract deployment: (Not yet deployed)
- Fontend src: (Not yet implemented)

A simplified illustration of how a human might anonymously claim their alloted UBI.

## Developing in this monorepo

Each sub project expects a `.env` file to be configured by the developer. (See the respective `.env.example` files.)

### Building the frontends

1. Run `yarn` at the root of the monorepo
2. Run `yarn build:registration` or yarn `build:anon-mood-index` (depending which you're developing)

### Developing the contracts

1. Run `yarn` at the root of the monrepo.
2. `cd packages/poh-semaphore-contracts`

- To compile `npx hardhat compile`
- To test `npx hardhat test`
- To deploy `npx hardhat deploy:<NAME> --VARIOUS ARGS` (see individual deploy scripts in [packages/poh-semaphore-contracts/tasks](packages/poh-semaphore-contracts/tasks))
