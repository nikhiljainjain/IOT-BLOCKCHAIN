const { INITIAL_BALANCE } = require('../config');
const Transaction = require('./transaction');
const ChainUtil = require('../chain-util');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `Wallet- 
        Balance  : ${this.balance},
        PublicKey: ${this.publicKey.toString()}
        `;
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain);

        if (amount > this.balance) {
           console.log(`Amount: ${amount} is greater than your ${this.balance}`);
           return `Amount: ${amount} is greater than your ${this.balance}`;
       }

       let transaction = transactionPool.existingTransaction(this.publicKey);

       if (transaction)
           transaction.update(this, recipient, amount);
       else{
           transaction = Transaction.newTransaction(this, recipient, amount);
           transactionPool.updateOrAddTransaction(transaction);
       }
        return transaction;
    }

    calculateBalance(blockchain) {
        let transactions = [];
        let balance = this.balance;
        blockchain.chain.forEach(block => block.data.forEach(transaction => { transactions.push(transaction);}));

        //finding all the transaction related this wallet
        const walletInputTs = transactions.filter(t => t.input.address === this.publicKey);
        let startTimeStamp = 0;

        if (walletInputTs.length > 0){
            const recentInputT = walletInputTs.reduce(
                (prev, current) => prev.input.timeStamp > current.input.timeStamp ? prev : current
            );

            balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
            startTimeStamp = recentInputT.input.timeStamp;
        }

        transactions.forEach(transaction => {
            if (transaction.input.timeStamp > startTimeStamp){
                transaction.outputs.forEach(output => {
                    if (output.address === this.publicKey)
                        balance += output.amount;
                });
            }
        });

        return balance;
    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'unknown-blockchain-wallet';
        return blockchainWallet;
    }
    
}

module.exports = Wallet;