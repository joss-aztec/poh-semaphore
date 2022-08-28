pragma circom 2.0.5;

include "../node_modules/circomlib/circuits/poseidon.circom";

template CalculateIdentityProxy() {
    signal input serviceNullifier;
    signal input identityNullifier;

    signal output out;

    component poseidon = Poseidon(2);

    poseidon.inputs[0] <== serviceNullifier;
    poseidon.inputs[1] <== identityNullifier;

    out <== poseidon.out;
}

template CalculateExternalNullifier() {
    signal input identityProxy;
    signal input randomNonce;

    signal output out;

    component poseidon = Poseidon(2);

    poseidon.inputs[0] <== identityProxy;
    poseidon.inputs[1] <== randomNonce;

    out <== poseidon.out;
}

template CalculateNullifierHash() {
    signal input externalNullifier;
    signal input identityNullifier;

    signal output out;

    component poseidon = Poseidon(2);

    poseidon.inputs[0] <== externalNullifier;
    poseidon.inputs[1] <== identityNullifier;

    out <== poseidon.out;
}

template NullifierConsistency() {
    signal input serviceNullifier;
    signal input identityProxy;
    signal input externalNullifier;
    signal input nullifierHash;
    signal input privIdentityNullifier;
    signal input privRandomNonce;

    component calculateIdentityProxy = CalculateIdentityProxy();
    calculateIdentityProxy.serviceNullifier <== serviceNullifier;
    calculateIdentityProxy.identityNullifier <== privIdentityNullifier;
    calculateIdentityProxy.out === identityProxy;

    component calculateExternalNullifier = CalculateExternalNullifier();
    calculateExternalNullifier.identityProxy <== calculateIdentityProxy.out;
    calculateExternalNullifier.randomNonce <== privRandomNonce;
    calculateExternalNullifier.out === externalNullifier;

    component calculateNullifierHash = CalculateNullifierHash();
    calculateNullifierHash.externalNullifier <== calculateExternalNullifier.out;
    calculateNullifierHash.identityNullifier <== privIdentityNullifier;
    calculateNullifierHash.out === nullifierHash;

}

component main { public [ serviceNullifier, identityProxy, externalNullifier, nullifierHash ] } = NullifierConsistency();
