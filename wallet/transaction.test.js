const Transaction = require('./transaction');
const Wallet = require('./index');
const { MINING_REWARD, TRANSACTION_FEES } = require('../config');

describe('transaction testing', ()=>{
    let wallet, recipient, transaction, amount;

    beforeEach(()=>{
        wallet = new Wallet();
        recipient = 'r3cip13nt';
        amount = 50;
        transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('output the `amount` should transferred from sender wallet', ()=>{
        //console.log(transaction.output.find(output => output.address == wallet.publicKey));
        expect(transaction.outputs.find(output => output.address == wallet.publicKey).amount)
            .toEqual(wallet.balance - amount - TRANSACTION_FEES);
    });

    it('output the `amount` should transfer to recipient', ()=>{
        expect(transaction.outputs.find(output => output.address === recipient).amount).toEqual(amount);
    });

    it('input the balance of the wallet', ()=>{
        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it('validating the transaction', ()=>{
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    it('invalidating the transaction', ()=>{
        transaction.outputs[0].amount = 999999;
        expect(Transaction.verifyTransaction(transaction)).toBe(false);
    });

    describe('when amount exceeds', ()=>{
        beforeEach(()=>{
            amount = 5000;
            transaction = Transaction.newTransaction(wallet, recipient, amount);
        });

        it('output the `amount` exceeds the wallet balance', ()=>{
            expect(transaction).toEqual(undefined);
        });
    });

    describe('updating the transaction', ()=>{

        let nextAmount, nextRecepient;

        beforeEach(()=>{
            nextAmount = 30;
            nextRecepient = 'n3xt-4ddr355';
            transaction = transaction.update(wallet, nextRecepient, nextAmount);
        });

        it('subtracting amount from sender wallet for next transaction', ()=>{
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(wallet.balance - amount - nextAmount - TRANSACTION_FEES);
        });

        it('Adding amount to new recepient  wallet', ()=>{
            expect(transaction.outputs.find(output => output.address === nextRecepient).amount)
                .toEqual(nextAmount);
        });
    });

    describe('creating reward transaction', ()=>{

        beforeEach(()=>{
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
        });

        it('reward the miner wallet', ()=>{
            expect(transaction.outputs.find( o => o.address === wallet.publicKey).amount).toEqual(MINING_REWARD + TRANSACTION_FEES);
        });

    });
});