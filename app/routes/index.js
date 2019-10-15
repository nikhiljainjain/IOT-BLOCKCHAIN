const express = require('express');
const router = express.Router();

const P2pServer = require('../p2p-server');
const Blockchain = require('../../blockchain');
const Wallet = require('../../wallet');
const TransactionPool = require('../../wallet/transaction-pool');
const Miner = require('../miner');

let bc = new Blockchain();
let wallet = new Wallet();
let tp = new TransactionPool();
let p2pServer = new P2pServer(bc, tp);
let miner = new Miner(bc, tp, wallet, p2pServer);

router.get('/', function(req, res, next) {
    res.render('index', { title: 'NIKHIL$JAIN' });
});

router.get('/blocks', (req, res)=>{
	//console.log(bc.chain);
	res.json(bc.chain);
});

router.get('/transactions', (req, res)=>{
	res.json(tp.transactions);
});

router.get('/public-key', (req, res)=>{
	res.json({publicKey: wallet.publicKey});
});

wallet.balance = wallet.calculateBalance(bc);

router.get('/balance', (req, res)=>{
	res.json({balance : wallet.balance});
});

router.get('/mine-transactions', (req, res)=>{
	const block = miner.mine(wallet);
	console.log(`New block added: ${block}`);
	res.status(302).redirect('/blocks');
});

router.get('/balance', (req, res)=>{
    res.json({'Balance' : wallet.balance});
});

router.post('/transact', (req, res)=>{
	const { recipient, amount } = req.body;
	const transaction = wallet.createTransaction(recipient, amount, bc, tp);
	if(typeof(transaction) === 'object'){
		p2pServer.broadcastTransaction(transaction);
		res.status(302).redirect('/transactions');
	}else
		res.json({msg: transaction});
});

router.post('/mine', (req, res)=>{
	const nwBlock = bc.addBlock(req.body.data);
	console.log(`New block added  ${nwBlock.toString()}`);
	p2pServer.syncChain();
	res.status(302).redirect('/blocks');
});

p2pServer.listen();
module.exports = router;