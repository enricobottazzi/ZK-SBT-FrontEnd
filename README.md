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
- Add a proof generator hook on the frontend. For this you only need the circuit-specific verification key `circuit_final.zkey` and circuit compiled in .wasm format `circuit.wasm`. The proof generator will then take the input from the user such as:
    - `Claim`
    - `Signature` 
- Note that the `Claim` is the only private input for our [circuit](https://github.com/enricobottazzi/ZK-SBT/blob/main/circuits/verify.circom) and it should never be shared with the verfier. That's why the proof generation happens entirely on the brower level.
- The other inputs such as Issuer's `PubKey` and the ones related to verifier's query `claimSchema`, `slotIndex`, `operator` and `value` are passed to the proof generator as public contants. 
- Interact with the smart contract

from `const uint64_max = BigInt(2) ** BigInt(64)` to `const uint64_max = BigInt(2 ** 64)` inside fvnHash function

### Resources

The source code from the front-end application is massively borrowed from [a16z](https://github.com/a16z/zkp-merkle-airdrop-fe-ex). 

Modify the witness calculator file to support the proof generation. 

### To Do 

- Show elegible for the airdrop
- Manually extract the TokenID 
- Add button to mint you an NFT for testing. How can I store the key locally on the frontend?
- Deploy on Vercel 
- TEST the "No SBT associated with this account erroe"


### Test 

- You need to pre-mint a token to your address
- Generate proof. When generating the proof it gets display in 4 blocks. `A`, `B` and `C` are a set of elliptic curve points that represent the actual proof, while `public` represents the public input for the circuit uside inside the Snark. Note that these will be used as parameters inside our smart contract call to the `Private Over18 Airdrop Contract Address`
- Verify the proof
- Test it by using 

