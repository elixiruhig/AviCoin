const {Blockchain,Transaction} = require('./Blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const myKey = ec.keyFromPrivate('11ed23183c559b8f1fbe58f4af77ec773c57810766a7c1235115479ec15628c1');
const walletAddress = myKey.getPublic('hex');


let avicoin = new Blockchain();
const tx1 = new Transaction(walletAddress,'public key',-500);
tx1.signTransaction(myKey);
avicoin.addTransaction(tx1);
console.log("Starting the miner........");
avicoin.minePendingTransactions(walletAddress);
console.log("Avi's balance is :"+avicoin.getBalance("walletAddress"));
const tx2 = new Transaction(walletAddress,'public key',-60);
tx2.signTransaction(myKey);
avicoin.addTransaction(tx2);
console.log("Starting the miner........");
avicoin.minePendingTransactions("walletAddress");
console.log("Avi's balance is :"+avicoin.getBalance("walletAddress"));
