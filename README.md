# ZK-Lego
Modular plug and play solution to create ZK Dapps

# Module 1 - ZK SBT

### App-integrator

I'm a DeFi lending platform wanting to allow only people that are >18 yo. 

```solidity    
// @notice verifies the validity of the proof. if verified, lend money to the msg sender
    
    function lendingMachine(uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[72] memory input,
            ) public 
    {   
        // Further check on the public inputs are required, this is a simplified version
        require(
            verifier.verifyProof(a, b, c, input),
            "Proof verification failed"
        );

        // ... Lend money
    }
```

The core of the verification lies in `verifier.verifyProof(a, b, c, input)` 

The verifier contract is an external contract deployed by the ZK SBT protocol creator. To verify the proof inside your Dapp all you need is to make an external call to that contract. 

[**Deployed Verifier contract**](https://mumbai.polygonscan.com/address/0xB12EF009346dc2c684E6eC431f98E57473281A9d#code).

If another Dapp wants to set entry conditions based on a creditScore claim the process looks the same. They just need to integrate an external call to the `verifier.sol` contract deployed by the protocol originator.


### How to Integrate - step by step guide

- Install SnarkJS in your client-side application
- Add a proof generator hook
- Modify the witness calculator file to support the proof generation. 
- Interact with the smart contract

from `const uint64_max = BigInt(2) ** BigInt(64)` to `const uint64_max = BigInt(2 ** 64)` inside fvnHash function