const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

class Miner{
	constructor(blockchain, transactionPool, wallet, p2pServer){
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.p2pServer = p2pServer;
	}

	/*transactionFees(senderWallet){
		//new transaction from sender wallet to miner wallet
		const fees = this.Transaction.newTransaction(senderWallet, this.wallet, 1);
	}*/

	mine(senderWallet){
		const validTransactions = this.transactionPool.validTransactions();
		//extracting transaction that done by senderwallet
		const senderTransactions = this.transactionPool.extractTransactions(senderWallet, validTransactions);
		//include a reward for the miner
		senderTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
		//create a block consisting of the valid transactions
		const block = this.blockchain.addBlock(senderTransactions);
		//synchronize the chains  in the peer-to-peer server
		this.p2pServer.syncChain();
		//clear the local transaction pool
		this.transactionPool.clear();
		//broadcast to every miner to clear their transaction pools
		this.p2pServer.broadcastClearTransaction();

		return block;
	}
}

module.exports = Miner;