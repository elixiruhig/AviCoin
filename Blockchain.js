const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Block{
	constructor(timestamp,transactions,previousHash = ''){
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;
		this.hash = this.getHash();
    this.nonce = 0;
	}

	getHash(){
		return SHA256(this.timestamp+this.previousHash+JSON.stringify(this.transactions)+this.nonce).toString();

	}

  mineBlock(difficulty){
    while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join("0")){
      this.nonce++;
      this.hash = this.getHash();
    }
    console.log("Block mined : "+this.hash);
  }

	hasValidTransactions(){
		for(const trans of this.transactions){
			if(!trans.isValid()){
				return false;
			}
		}
		return true;
	}

}

class Transaction{
  constructor(fromAddress,toAddress,amount){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

	getHash(){
		return SHA256(this.fromAddress + this.toAddress +  this.amount).toString();
	}

	signTransaction(signingKey){

		if(signingKey.getPublic('hex') !== this.fromAddress){
			throw new Error("You cannot sign other people's transactions");
		}

		const hashTx = this.getHash();
		const sign = signingKey.sign(hashTx, 'base64');
		this.signature = sign.toDER('hex');
	}

	isValid(){
		if(this.fromAddress === null){
			return true;
		}
		if(!this.signature || this.signature.length === 0){
			throw new console.error("No signature");
		}

		const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
		return publicKey.verify(this.getHash(),this.signature);
	}

}

class Blockchain{
	constructor(){
		this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
	}

	createGenesisBlock(){
		return new Block("01/01/2019","This is Sparta","0");
	}

	getLatestBlock(){
		return this.chain[this.chain.length-1];
	}

minePendingTransactions(rewardAddress){
  let block = new Block(Date.now(),this.pendingTransactions);
  block.mineBlock(this.difficulty);
  console.log("Mined block successfully");
  this.chain.push(block);
  this.miningReward = this.getLatestBlock().transactions.length * 10;
  this.pendingTransactions = [
    new Transaction(null,rewardAddress,this.miningReward)
  ];
}

addTransaction(transaction){
	if(!transaction.fromAddress || !transaction.toAddress){
		throw new console.error("Enter a valid address");
	}

	if(!transaction.isValid()){
		throw new console.error("Transaction not valid");
	}

  this.pendingTransactions.push(transaction);
}

getBalance(address){
  let balance = 0;
  for(const block of this.chain){
    for(const trans of block.transactions){
      if(trans.fromAddress === address){
        balance -= trans.amount;
      }
      else if(trans.toAddress === address){
        balance += trans.amount;
      }
    }
  }
  return balance;
}

  isChainValid(){
    for(let i=1;i < this.chain.length;i++){
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i-1];

			if(!currentBlock.hasValidTransactions()){
				return false;
			}

      if(currentBlock.hash !== currentBlock.getHash()){
        return false;
      }
      else if(currentBlock.previousHash !== previousBlock.hash){
        return false;
      }
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
