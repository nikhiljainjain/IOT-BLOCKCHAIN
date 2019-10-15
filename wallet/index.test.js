const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const { INITIAL_BALANCE, TRANSACTION_FEES } = require('../config');

describe('Wallet', ()=>{
    let wallet, tp, bc;

    beforeEach(()=>{
        wallet = new Wallet();
        tp = new TransactionPool();
        bc = new Blockchain();
    });

    describe('doing the transaction', ()=>{
        let recepient, sendAmount, transaction;

        beforeEach(()=>{
            recepient = "r4nd0m-4ddr3ss";
            sendAmount = 51;
            transaction = wallet.createTransaction(recepient, sendAmount, bc, tp);
        });

        describe('doing the same transaction again', ()=>{

            beforeEach(()=>{
                transaction.update(wallet, recepient, sendAmount);
            });

            it('double of `sendAmount` dedicated from sender wallet', ()=>{
                expect(transaction.outputs.find(o => o.address === wallet.publicKey).amount)
                    .toEqual(wallet.balance - (2*sendAmount  + TRANSACTION_FEES));
            });

            it('double of `sendAmount` send to recepient', ()=>{
                expect(transaction.outputs.filter(o => o.address === recepient)
                    .map(output => output.amount))
                    .toEqual([sendAmount, sendAmount]);
            });

        });

    });

    describe('calculating a balance', ()=>{
        let addBalance, repeatAdd, senderWallet;

        beforeEach(()=>{
            addBalance = 109;
            repeatAdd = 3;
            senderWallet = new Wallet();
            for(let i=0;i< repeatAdd;i++){
                senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
            }
            bc.addBlock(tp.transactions);
        });

        it('calculating the balance for the blockchain transaction matching the recipient', ()=>{
            expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
        });

        it('calculating the balance for the blockchain transaction matching the sender', ()=>{
            expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd + TRANSACTION_FEES));
        });

        describe('and recipient conducts a transactions', ()=>{
            let subtractBalance, recipientBalance;

            beforeEach(()=>{
                tp.clear();
                subtractBalance = 51;
                recipientBalance = wallet.calculateBalance(bc);
                wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp);
                bc.addBlock(tp.transactions);
            });

            describe('and the sender another transaction to the recipient', ()=>{

                beforeEach(()=>{
                    tp.clear();
                    senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
                    bc.addBlock(tp.transactions);
                })

                it('calculate the recipient balance only using transactions since its most recent one', ()=>{
                    expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance - TRANSACTION_FEES);
                });
            })
        });
    });

});