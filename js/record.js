/**
 * MoeMarry - record.js
 * Copyright (c) 2018 MING-CHIEN LEE
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
window.addEventListener('load', function () {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    if (web3.currentProvider.isMetaMask) {
        $("#onlineStatus").css("background", "#80c97e");
        $("#statusText").text('Web3: MetaMask connected!');
        web3.version.getNetwork((err, netId) => {
            switch (netId) {
                case "1":
                    $("#netStatus").text('Network: mainnet');
                    break;
                case "2":
                    $("#netStatus").text('Network: deprecated Morden test network');
                    break;
                case "3":
                    $("#netStatus").text('Network: ropsten test network');
                    break;
                case "4":
                    $("#netStatus").text('Network: Rinkeby test network');
                    break;
                case "42":
                    $("#netStatus").text('Network: Kovan test network');
                    break;
                default:
                    $("#netStatus").text('Network: Unknown');
            }
        });
        var account = web3.eth.accounts[0];
        $("#address").text("Address: " + account);
        var accountInterval = setInterval(function () {
            if (web3.eth.accounts[0] !== account) {
                account = web3.eth.accounts[0];
                $("#address").text("Address: " + account);
            }
        }, 100);
    } else {
        $("#statusText").text('Web3: MetaMask not connected!');
        $("#formBody").html('<h1 style="text-align:center;">未偵測到 MetaMask!</h1><p style="text-align:center">請點選<a href="https://metamask.io/">本連結</a>到 MetaMask 官網下載並建立你的錢包!</p>');
    }
});

function recordMarriage() {
    $("#partner1").removeClass("invalid");
    $("#partner2").removeClass("invalid");
    $("#marriageDate").removeClass("invalid");
    var partner1 = $("#partner1").val();
    var partner2 = $("#partner2").val();
    var marriageDate = $("#marriageDate").val();
    if (partner1 != "" && partner2 != "" && marriageDate != "") {
        var dateTime = new Date(marriageDate).getTime();
        var timestamp = Math.floor(dateTime / 1000);
        //TODO: Error fallback
        $("#formBody").html('<svg class="spinner" style="display: block; margin: auto;" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg><br><h5 style="text-align:center;">建立結婚紀錄中...</h5>');
        BrowserSolc.loadVersion("soljson-v0.4.24+commit.e67f0147.js", function (compiler) {
            source = `pragma solidity ^0.4.24; contract owned { address public owner; constructor() public { owner = msg.sender; } modifier onlyOwner { require(msg.sender == owner); _; } function transferOwnership(address newOwner) onlyOwner public { owner = newOwner; } } contract Marriage is owned { bytes32 public partner1; bytes32 public partner2; uint256 public marriageDate; bytes32 public marriageStatus; bytes public imageHash; bytes public marriageProofDoc; constructor() public { createMarriage(); } function createMarriage() onlyOwner public { partner1 = "${partner1}"; partner2 = "${partner2}"; marriageDate = ${timestamp}; setStatus("Married"); bytes32 name = "Marriage Contract Creation"; majorEventFunc(marriageDate, name, "We got married!"); } function setStatus(bytes32 status) onlyOwner public { marriageStatus = status; majorEventFunc(block.timestamp, "Changed Status", status); } function setImage(bytes IPFSImageHash) onlyOwner public { imageHash = IPFSImageHash; majorEventFunc(block.timestamp, "Entered Marriage Image", "Image is in IPFS"); } function marriageProof(bytes IPFSProofHash) onlyOwner public { marriageProofDoc = IPFSProofHash; majorEventFunc(block.timestamp, "Entered Marriage Proof", "Marriage proof in IPFS"); } function majorEventFunc(uint256 eventTimeStamp, bytes32 name, bytes32 description) public { emit MajorEvent(block.timestamp, eventTimeStamp, name, description); } event MajorEvent(uint256 logTimeStamp, uint256 eventTimeStamp, bytes32 indexed name, bytes32 indexed description); function () public { revert(); } }`;
            optimize = 1;
            result = compiler.compile(source, optimize);
            var resultBytecode = (result.contracts[":Marriage"].bytecode);
            web3.eth.sendTransaction({ data: resultBytecode }, function (err, transactionHash) {
                if (!err)
                    //TODO: Change etherscan URL　between different network
                    $("#formBody").html('<h1 style="text-align:center;">順利送出結婚登記💖🎉</h1><p style="text-align:center;color:red;">⚠ 請點選下方 TxID 待交易確認完後檢查是否登記成功，在部分特殊情況下有可能會登記失敗，敬請注意!</p><p id="TxID"　style="text-align:center;"></p>');
                    $("#TxID").html('TxID: <a href="https://etherscan.io/tx/' + transactionHash + '">' + transactionHash + '</a> (請保存此 TxID 以追蹤結婚紀錄)');
            });
        });
    } else {
        if (partner1 == "") {
            $("#partner1").addClass("invalid");
        }
        if (partner2 == "") {
            $("#partner2").addClass("invalid");
        }
        if (marriageDate == "") {
            $("#marriageDate").addClass("invalid");
        }
    }


}

$("#recordMarriage").click(function (event) {
    recordMarriage();
    event.preventDefault();
});
