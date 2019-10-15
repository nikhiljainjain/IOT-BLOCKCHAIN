const express = require('express');
const router = express.Router();

const P2pServer = require('../p2p-server');
const Blockchain = require('../../blockchain');

let bc = new Blockchain();
let p2pServer = new P2pServer(bc);

router.get('/', function(req, res, next) {
    res.render('index');
});

//it sends complete block chain
router.get('/blocks', (req, res)=>{
	res.json(bc.chain);
});

//Getting data and mine to the blockchain
router.post('/mine', (req, res)=>{
	const nwBlock = bc.addBlock(req.body.data);
	console.log(`New block added  ${nwBlock.toString()}`);
	p2pServer.syncChain();
	res.status(302).redirect('/blocks');
});

p2pServer.listen();
module.exports = router;