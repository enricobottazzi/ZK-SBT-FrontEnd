import generateProof from '../utils/generate-proof.js';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { providers, Contract } from 'ethers';

export default function IndexPage() {

  const [state, setState] = React.useState({
    claim: "",
    signature: "",
    airdropAddress: "",
    proof: "",
    tokenId : "",
    loading: false,
    drop: false
  })

  let handleCalcProof = () => {
    calculateProof(state, setState);
  }

  let handleCollect = () => {
    collectDrop(state, setState);
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
                  Signature 
                  </div>
                </div>
                <input
                  type="text"
                  name="signature"
                  className="form-control"
                  value={state.signature}
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
              <span className="sr-only">Loading...</span>
            </div>
            :
            <p></p>
          }

          {state.drop? 
            <div class="alert alert-success" role="alert">
            Congratulations! You successfully claimed your airdrop
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
                  No proof generated yet
                </div> 
              :
                <div>
                  <div className="input-group-text">
                  A 
                  </div>  
                  <div>                 
                  {state.proof[0][0]}, {state.proof[0][1]}
                  </div> 
                  <div className="input-group-text">
                  B 
                  </div> 
                  <div>     
                  {state.proof[1][0][0]}, {state.proof[1][0][1]}, {state.proof[1][1][0]}, {state.proof[1][1][1]}
                  </div>
                  <div className="input-group-text">
                  C 
                  </div> 
                  <div>     
                  {state.proof[2][0]}, {state.proof[2][1]}
                  </div>
                  <div className="input-group-text">
                  Pub Inputs
                  </div>
                  {(() => { let pubInputs = [];
                    for (let i=0; i<state.proof[3].length; i++) {
                      pubInputs.push(<div>{state.proof[3][i]}</div>)
                  } return pubInputs
                  })()}
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

async function calculateProof(state, setState) {
  if (state.claim === '' || state.signature === '')  {
    alert("One of the input value for proof generation hasn't been provided ")
    return
  }
  setState({...state, loading:true})

  // Load files and run proof locally
  let DOMAIN = "http://localhost:3000";
  let wasmBuff = await getFileBuffer(`${DOMAIN}/circuit.wasm`);
  let zkeyBuff = await getFileBuffer(`${DOMAIN}/circuit_final.zkey`);

  
  let preTime = new Date().getTime();
  let proof = await generateProof(state.claim, state.signature, wasmBuff, zkeyBuff);
  let elapsed =  new Date().getTime() - preTime;
  console.log(`Time to compute proof: ${elapsed}ms`);

  setState({...state, proof: proof, loading:false})
}

async function collectDrop(state, setState) {

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
  let contract = new Contract(state.airdropAddress, AIRDROP_JSON.abi, provider.getSigner());

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

  setState({...state, loading:false, drop:true})
}


async function getFileBuffer(filename) {
  let req = await fetch(filename);
  return Buffer.from(await req.arrayBuffer());
}