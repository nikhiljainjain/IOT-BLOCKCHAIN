const TransactionPool= require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', ()=>{
    let wallet, transaction, tp, bc;

    beforeEach(()=>{
        bc = new Blockchain();
        wallet = new Wallet();
        tp = new TransactionPool();
        transaction = wallet.createTransaction('unknown', 37, bc, tp);
    });

    it('adding transaction to the pool', ()=>{
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
    });

    it('checking for transaction pool get updated', ()=>{
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'virus', 51);
        tp.updateOrAddTransaction(newTransaction);
        
        expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
            .not.toEqual(oldTransaction);
    });

    it('clear transactions', ()=>{
        tp.clear();
        expect(tp.transactions).toEqual([]);
    });

    describe('mixing of valid and corrupt transaction ', ()=>{
        let validTransaction;

        beforeEach(()=>{
            validTransaction = [...tp.transactions];
            for (let i=0;i<2;i++){
                wallet = new Wallet();
                transaction = wallet.createTransaction('unknown', 37, bc, tp);
                if (i%2==0)
                    transaction.input.amount = 9993;
                else    
                    validTransaction.push(transaction);
            }
        });

        it('show difference between valid & corrupt transaction', ()=>{
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransaction));
        });

        it('grabs valid transaction', ()=>{
            expect(tp.validTransactions()).toEqual(validTransaction);
        });
    });
});