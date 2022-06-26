import generateProof from '../utils/generate-proof.js';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { providers, Contract } from 'ethers';


export default function IndexPage() {


  const [state, setState] = React.useState({
    claim: "",
    sigR8x: "",
    sigR8y: "",
    sigS: "",
    pubKeyX: "",
    pubKeyY: "",
    airdropAddress: "",
    proof: "",
    tokenId : "",
    loading: false
  })

  let handleCalcProof = () => {
    calculateProof(state.claim, state.sigR8x, state.sigR8y, state.sigS, state.pubKeyX, state.pubKeyY, state, setState);
  }
// fix this call, Do I need the state?

  let handleCollect = () => {
    collectDrop(state.proof, state.airdropAddress, state, setState);
  }


  return (
    <div className="container">

    <div className="row">
      <div className="col-2"></div>
      <div className="col text-center">
        <h1>ZK OVER 18 Private Airdrop</h1>
      </div>
    </div>

    <div className="row justify-content-center">
      <div className="col-2"></div>
      <div className="col-8">

        <div className="mt-3">
          <div className="card">
            <div className="card-header">
              Calculate proof and collect airdrop
            </div>

            <div className="card-body">

              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    Claim
                  </div>
                </div>
                <input
                  type="text"
                  name="claim"
                  className="form-control"
                  value={state.claim}
                  onChange={evt => setState({...state, [evt.target.name]: evt.target.value})}
                  />
              </div>

              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                  sigR8x 
                  </div>
                </div>
                <input
                  type="text"
                  name="sigR8x"
                  className="form-control"
                  value={state.sigR8x}
                  onChange={evt => setState({...state, [evt.target.name]: evt.target.value})}
                  />
              </div>

              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                  sigR8y 
                  </div>
                </div>
                <input
                  type="text"
                  name="sigR8y"
                  className="form-control"
                  value={state.sigR8y}
                  onChange={evt => setState({...state, [evt.target.name]: evt.target.value})}
                  />
              </div>

              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                  sigS 
                  </div>
                </div>
                <input
                  type="text"
                  name="sigS"
                  className="form-control"
                  value={state.sigS}
                  onChange={evt => setState({...state, [evt.target.name]: evt.target.value})}
                  />
              </div>

              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                  pubKeyX 
                  </div>
                </div>
                <input
                  type="text"
                  name="pubKeyX"
                  className="form-control"
                  value={state.pubKeyX}
                  onChange={evt => setState({...state, [evt.target.name]: evt.target.value})}
                  />
              </div>

              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                  pubKeyY 
                  </div>
                </div>
                <input
                  type="text"
                  name="pubKeyY"
                  className="form-control"
                  value={state.pubKeyY}
                  onChange={evt => setState({...state, [evt.target.name]: evt.target.value})}
                  />
              </div>

        
              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    Private Over18 Airdrop Contract Address
                  </div>
                </div>
                <input
                  type="text"
                  name="airdropAddress"
                  className="form-control"
                  value={state.airdropAddress}
                  onChange={evt => setState({...state, [evt.target.name]: evt.target.value})}
                  />
              </div>

              <div className="input-group mt-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    Token ID
                  </div>
                </div>
                <input
                  type="text"
                  name="tokenId"
                  className="form-control"
                  value={state.tokenId}
                  onChange={evt => setState({...state, [evt.target.name]: evt.target.value})}
                  />
              </div>

            </div>

            <div className="card-footer"> 
              <button className="btn btn-primary" onClick={handleCalcProof}>Calculate Proof</button>
              <button className="btn btn-warning ml-2" onClick={handleCollect}>Collect Drop</button>
            </div>
          </div>
        </div>

  

          {state.loading? 
            <div className="spinner-border m-5" role="status">
              {/* <span className="sr-only">Loading...</span> */}
            </div>
            :
            <p></p>
          }


          <div className="card">
            <div className="card-header">
              Proof
            </div>
            <div className="card-body">
              {state.proof === ''?
                <div>
                  No proof calculated
                </div> 
              :
                <div>
                  A: {state.proof[0]} <br/>
                  B: {state.proof[1]} <br/>
                  C: {state.proof[2]} <br/>
                  pubInput: {state.proof[3]}
                </div>
              }
            </div>
          </div>


        </div>
        <div className="col-4"></div>
      </div>
    </div>
  )
}

async function calculateProof(claim, sigR8x, sigR8y, sigS, pubKeyX, pubKeyY, state, setState) {
  if (state.claim === '' || state.sigR8x === '' || state.sigR8y === '' || state.sigS === '' || state.pubKeyX === '' || state.pubKeyY === '')  {
    alert("One of the input value for proof generation hasn't been provided ")
    return
  }
  setState({...state, loading:true})

  // // Connect to wallet, get address
  // let provider = new providers.Web3Provider(window.ethereum);
  // await provider.send("eth_requestAccounts", []);
  // let signer = provider.getSigner();
  // let address = await signer.getAddress();


  // Load files and run proof locally
  let DOMAIN = "http://localhost:3000";
  let wasmBuff = await getFileBuffer(`${DOMAIN}/circuit.wasm`);
  let zkeyBuff = await getFileBuffer(`${DOMAIN}/circuit_final.zkey`);

  
  let preTime = new Date().getTime();
  let proof = await generateProof(claim, sigR8x, sigR8y, sigS, pubKeyX, pubKeyY, wasmBuff, zkeyBuff);
  let elapsed =  new Date().getTime() - preTime;
  console.log(`Time to compute proof: ${elapsed}ms`);

  setState({...state, proof: proof, loading:false})
}

async function collectDrop(proof, airdropAddr, state, setState) {

  const AIRDROP_JSON = require('../ABIS/PrivateOver18Airdrop.json');

  if (state.proof === '') {
    alert("No proof calculated yet!")
    return
  }
  if (state.airdropAddress === '') {
    alert("No airdrop address entered!")
    return
  }

  setState({...state, loading:true})

  let provider = new providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  let contract = new Contract(airdropAddr, AIRDROP_JSON.abi, provider.getSigner());

  let a = state.proof[0];
  let b = state.proof[1];
  let c = state.proof[2];
  let pubInput = state.proof[3];

  try {
    let tx = await contract.collectAirdrop(a, b, c, pubInput, state.tokenId);
    await tx.wait()
    console.log("Drop collected!")
  } catch (error) {
    alert("Airdrop collection failed: " + error)
  }

  setState({...state, loading:false})
}


async function getFileBuffer(filename) {
  let req = await fetch(filename);
  return Buffer.from(await req.arrayBuffer());
}