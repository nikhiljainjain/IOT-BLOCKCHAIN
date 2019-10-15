const Transaction = require("./transaction"); 

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction) {
        //console.log(this.transactions, transaction);
        const transactionWithId = this.transactions.find(t => t.id === transaction.id);

        if (transactionWithId)
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        else
            this.transactions.push(transaction);
    }

    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address);
    }

    validTransactions(){
        //console.log(this.transactions);
        return this.transactions.filter(t => {
            const outputTotal = t.outputs.reduce((total, output)=>{
                //console.log(total, output.amount);
                return total + output.amount;
            }, 0);
            //console.log(t.output, outputTotal, t.input.amount, t.outputs);
            if (t.input.amount  !== outputTotal){
                console.log(`Invalid transaction from ${t.input.address} address.`);
                return;
            }

            if (!Transaction.verifyTransaction(t)){
                console.log(`xInvalid transaction from ${t.input.address} address.`);
                return;
            }

            return t;
        });
    }
    
    extractTransactions(senderWallet, transactions){
        let position = 
         transactions.filter(t => {
            if (t.input.address === senderWallet.publicKey)
                return t;
        });
    }

    clear(){
        this.transactions = [];
    }
}

module.exports = TransactionPool;