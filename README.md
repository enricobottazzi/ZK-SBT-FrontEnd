# ZK-SBT-Frontend

This repo contains the frontend implementation related to the ZK-SBT protocol outlined in [this repo](https://github.com/enricobottazzi/ZK-SBT). 

### Demo

- Move to Mumbai testnet to get an NFT minted.
- Private Airdrop address: 0xB1d8Fe14Ce99CE92025F16fF41922F33860149A0
- Generate proof. When generating the proof it gets display in 4 blocks. `A`, `B` and `C` are a set of elliptic curve points that represent the actual proof, while `public` represents the public input for the circuit uside inside the Snark. Note that these will be used as parameters inside our smart contract call to the `Private Over18 Airdrop Contract Address`
- Verify the proof

## Integrate

The goal here is mainly to showcase how easy is to integrate ZK based verification inside your dapp. Let's consider a Dapp that only allows user over 18 to participate to the airdrop. The integration must happen on the smart contract level and on the frontend level

### Integrate - Smart contract

The first integration happens on a smart contract level: 

```solidity

    // @notice verifies the validity of the proof, and make further verifications on the public input of the circuit, if verified add the address to the list of eligible addresses
    function collectAirdrop(uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[72] memory input,
            uint256 _tokenID
            ) public 
    {   
        // Further check on the public inputs are required, this is a simplified version
        require(
            verifier.verifyProof(a, b, c, input),
            "Proof verification failed"
        );
        isElegibleForAirdrop[msg.sender] = true;
    }
}
```

The core of the verification lies in `verifier.verifyProof(a, b, c, input)` 

The verifier contract is an external contract deployed by the ZK SBT protocol creator. To verify the proof inside your Dapp all you need is to make an external call to that contract. 

[**Deployed Verifier contract**](https://mumbai.polygonscan.com/address/0xB12EF009346dc2c684E6eC431f98E57473281A9d#code)
[**Deployed Private Over18 Airdrop contract**]()
[**Deployed SBT Minter contract**]()

If another Dapp wants to set entry conditions based on a creditScore claim the process looks the same. They just need to integrate an external call to the `verifier.sol` contract deployed by the protocol originator inside their own smart contract that manages the lending conditions.

### Integrate - Frontend level

- Install SnarkJS in your client-side application
- Add a proof generator hook on the frontend. For this you only need the circuit-specific zkey file `circuit_final.zkey` that contains the proving and verification keys and circuit compiled in .wasm format `circuit.wasm`. The proof generator will then take the input from the user such as `Claim` and `Signature` to generate the proof. `Claim` is the only private input for our [circuit](https://github.com/enricobottazzi/ZK-SBT/blob/main/circuits/verify.circom) and it should never be shared with the verfier. That's why the proof generation happens entirely on the brower level.
- Add a collect drop hook on the frontend to let user make a call to the `collectAirdrop` function over Over18Airdrop smart contract. The proof generated in the previous step will be part of the calldata.

### Notes

The source code from the front-end application is massively borrowed from [a16z](https://github.com/a16z/zkp-merkle-airdrop-fe-ex). 
The `.babelrc` config file has been added to solve a BigInt compatibility problem generated inside the browser.

### To Do 

- Make a demo explanatory Video
- Deploy and verify the contracts
- Fix yarn and npm installations 