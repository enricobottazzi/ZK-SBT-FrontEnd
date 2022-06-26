const snarkjs = require('snarkjs');
const wc = require("./witness_calculator.js");

export default async function generateProof(claim, sigR8x, sigR8y, sigS, pubKeyX, pubKeyY, wasm_buff, zkey_buff) {

  const claimArr = claim.split(",");

  let input = {
    "claim": claimArr,
    "sigR8x": sigR8x,
    "sigR8y": sigR8y,
    "sigS": sigS,
    "pubKeyX": pubKeyX,
    "pubKeyY": pubKeyY,
    "claimSchema": "180410020913331409885634153623124536270",
    "slotIndex": 2,
    "operator": 3,
    "value": [18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
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


