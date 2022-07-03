import { pinJSONToIPFS } from "./pinata.js";
require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contractABI = require("../contract-abi.json");
const contractAddress = "0x4D445DB730D0Fe5266994e7df4817ef0F8E9bbaA";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

export const mint = async (name, team, role, startDate) => {
    if (name.trim() == "" || team.trim() == "" || role.trim() == "" || startDate.trim() == "") {
      return {
        success: false,
        status: "❗Please make sure all fields are completed before minting.",
      };
    }
  
    //make metadata
    const metadata = new Object();
    metadata.name = name;
    metadata.team = team;
    metadata.role = role;
    metadata.startDate = startDate;
  
    const pinataResponse = await pinJSONToIPFS(metadata);
    if (!pinataResponse.success) {
      return {
        success: false,
        status: "😢 Something went wrong while uploading your tokenURI.",
      };
    }
    const tokenURI = pinataResponse.pinataUrl;
  
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  
    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: window.ethereum.selectedAddress, // must match user's active address.
      data: window.contract.methods
        .mint(window.ethereum.selectedAddress, tokenURI)
        .encodeABI(),
    };
  
    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      return {
        success: true,
        status:
          "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
          txHash,
      };
    } catch (error) {
      return {
        success: false,
        status: "😥 Something went wrong: " + error.message,
      };
    }
};