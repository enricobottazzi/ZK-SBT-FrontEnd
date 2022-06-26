const snarkjs = require('snarkjs');
const wc = require("./witness_calculator.js");

export default async function generateProof(claim, signature, wasm_buff, zkey_buff) {

  const claimArr = claim.split(",");

  const sig = signature.split(",")

  const pubKeyX = "9582165609074695838007712438814613121302719752874385708394134542816240804696"
  const pubKeyY= "18271435592817415588213874506882839610978320325722319742324814767882756910515"
  const claimSchema= "180410020913331409885634153623124536270"
  const slotIndex = 2
  const operator = 3
  const value = [18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]


  let input = {
    "claim": claimArr,
    "sigR8x": sig[0],
    "sigR8y": sig[1],
    "sigS": sig[2],
    "pubKeyX": pubKeyX,
    "pubKeyY": pubKeyY,
    "claimSchema": claimSchema,
    "slotIndex": slotIndex,
    "operator": operator,
    "value": value
  }

  let witnessCalculator = await wc(wasm_buff);
  let wtns_buff = await witnessCalculator.calculateWTNSBin(input, 0);

  const { proof, publicSignals } =await snarkjs.groth16.prove(zkey_buff, wtns_buff);

  const solidityCallData = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

  const argv = solidityCallData
  .replace(/["[\]\s]/g, "")
  .split(",")

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];
  const pubInput = [];

  for (let i = 8; i < argv.length; i++) {
    pubInput.push(argv[i]);
  }

  const solidityProof = [a, b, c, pubInput];

  return solidityProof;

}


