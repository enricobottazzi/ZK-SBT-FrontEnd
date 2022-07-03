# ZK-SBT-Frontend

This repo contains the frontend implementation related to the ZK-SBT protocol outlined in the [original ZK-SBT repo](https://github.com/enricobottazzi/ZK-SBT). 

## Demo

- Run `yarn install` and `yarn dev` to locally deploy the frontend
- Visit `http://localhost:3000/` and move to Polygon Mumbai testnet inside your wallet
- Click `Mint a test SBT` to mint an Age SBT to your wallet. The claim attesting user's age and the signature of the claim are passed to the user off-chain. The SBT only contains an hash of the signature.
- Input the `claim` and the `signature` to generate the proof. When generating the proof it gets displayed in 4 blocks. `A`, `B` and `C` are a set of elliptic curve points that represent the actual proof, while `public` represents the public input used inside the Snark. 
- Once the proof is generated click `Collect Airdrop`. This will generate a call to the `Private Over18 Airdrop Contract` passing the proof generated in the previous step as calldata

## Integrate

The goal here is to showcase how easy is to integrate ZK based verification inside your dapp. Let's consider a Dapp that only allows user over 18 to participate to the airdrop. The integration must happen on the smart contract level and on the frontend level

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

The core of the verification lies in `verifier.verifyProof(a, b, c, input)` .

[The verifier contract](https://goerli.etherscan.io/address/0xcEb16d1aF04BD61A424262B5d0603E9a4cD74A36#code) is an external contract deployed by the ZK SBT protocol creator. To verify the proof inside your Dapp all you need is to make an external call to that contract. 

[**Deployed Private Over18 Airdrop contract**](https://goerli.etherscan.io/address/0x831d4aB546bE0CBB891b7C9eB294F7EC9dbAcEDD#code)

If another Dapp wants to set entry conditions based on a creditScore claim the process looks the same. They just need to integrate an external call to the `verifier.sol` contract deployed by the protocol originator inside their own smart contract that manages the lending conditions.

### Integrate - Frontend level

- Install [SnarkJS](https://github.com/iden3/snarkjs) in your client-side application
- Add a [proof generator hook](./utils/generate-proof.js) on the frontend. For this you only need the circuit-specific zkey file `circuit_final.zkey` that contains the proving and verification keys and circuit compiled in .wasm format `circuit.wasm`. The proof generator will then take the input from the user such as `Claim` and `Signature` to generate the proof. `Claim` is the only private input for our [circuit](https://github.com/enricobottazzi/ZK-SBT/blob/main/circuits/verify.circom) and it should never be shared with the verfier. That's why the proof generation happens entirely on the brower level.
- Add a [collect drop hook](./pages/index.js#L236) on the frontend to let user make a call to the `collectAirdrop` function over Over18Airdrop smart contract. The proof generated in the previous step will be part of the calldata.

### Notes

The source code from the front-end application is massively borrowed from [a16z](https://github.com/a16z/zkp-merkle-airdrop-fe-ex). 
The `.babelrc` config file has been added to solve a BigInt compatibility problem generated inside the browser.

### Demo 

[Youtube](https://youtu.be/pCP6XuUv4pc)