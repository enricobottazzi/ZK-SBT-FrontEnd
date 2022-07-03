import generateProof from '../utils/generate-proof.js';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { providers, Contract, utils} from 'ethers';

export default function IndexPage() {

  const [state, setState] = React.useState({
    claim: "",
    signature: "",
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

  let handleMint = () => {
    mintNFT(state, setState);
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

            </div>
            <div className="card-footer"> 
              <button className="btn btn-success" onClick={handleMint} >Mint a test SBT</button>
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

          {state.tokenId != "" && state.proof == "" ? 
            <div class="alert alert-success" role="alert">
            A SBT with tokenID {state.tokenId} was minted to you!

            <div> 
            Claim : 180410020913331409885634153623124536270,0,25,0,0,0,328613907243889777235018884535160632327,0
            </div> 
            
            <div>
            Signature : 13692340849919074629431384397504503745238970557428973719013760553241945274451,
            18066895302190271072509218697462294016350129302467595054878773027470753683267,
            238898180964301975640138172772451490757586081215817420470161945050687067203
            </div> 

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

async function mintNFT(state, setState) {

  const PRIVATESOULMINTER_JSON = require('../ABIS/PrivateSoulMinter.json');
  const privateSoulMinterAddress = "0x35564790237D94b36F7DF8d09E0f0Dd3197067f3"

  let provider = new providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  let contract = new Contract(privateSoulMinterAddress, PRIVATESOULMINTER_JSON.abi, provider.getSigner());

  setState({...state, loading:true})

  let sigR8x = "13692340849919074629431384397504503745238970557428973719013760553241945274451"
  let sigR8y = "18066895302190271072509218697462294016350129302467595054878773027470753683267"
  let sigS  = "238898180964301975640138172772451490757586081215817420470161945050687067203"

  let metaURI = "https://bafybeibodo3cnumo76lzdf2dlatuoxtxahgowxuihwiqeyka7k2qt7eupy.ipfs.nftstorage.link/"
  let claimHashMetadata = utils.solidityKeccak256(["uint", "uint", "uint"], [sigR8x, sigR8y, sigS])

  let tokenId

  try {
    let tx = await contract.mint(provider.getSigner().getAddress(), metaURI, claimHashMetadata);
    let receipt = await tx.wait();
    let id = receipt.events?.filter((x) => {return x.event == "Transfer"})[0].topics[3]

    tokenId = parseInt(id).toString()
    setState({...state, loading:false, tokenId:tokenId})

  } catch (error) {
    alert("Minting collection failed: " + error)
    setState({...state, loading:false})
  } 

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

  
  try {
    let proof = await generateProof(state.claim, state.signature, wasmBuff, zkeyBuff);
    setState({...state, proof: proof, loading:false, claim: "", signature: ""})

  } catch (error) {
    alert("Proof generation Failed: " + error)
    setState({...state, loading:false})
  } 
}

async function collectDrop(state, setState) {

  const AIRDROP_JSON = require('../ABIS/PrivateOver18Airdrop.json');
  const airdropAddress = "0xbCB89b65d6506CC803B0496403ed0A30CE504db8"

  if (state.proof === '') {
    alert("No proof calculated yet!")
    return
  }

  setState({...state, loading:true})

  let provider = new providers.Web3Provider(window.ethereum);
  let contract = new Contract(airdropAddress, AIRDROP_JSON.abi, provider.getSigner());

  let a = state.proof[0];
  let b = state.proof[1];
  let c = state.proof[2];
  let pubInput = state.proof[3];

  try {
    let tx = await contract.collectAirdrop(a, b, c, pubInput, state.tokenId);
    await tx.wait()
    console.log("Drop collected!")
    setState({...state, loading:false, drop:true})
  } catch (error) {
    alert("Aidrop collection Failed: " + error)
    setState({...state, loading:false})
  }

}

async function getFileBuffer(filename) {
  let req = await fetch(filename);
  return Buffer.from(await req.arrayBuffer());
}