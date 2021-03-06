let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

const P2pServer = require('./p2p-server');
const Blockchain = require('../blockchain');
const Feedback = require("./Feedback");

let bc = new Blockchain();
let fb = new Feedback();
let p2pServer = new P2pServer(bc, fb);

const HTTP_PORT = process.env.PORT || 3001; //http port

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
    res.render('pro');
});

//it sends complete block chain
app.get('/blocks', (req, res)=>{
	res.render("block-chain", { msg: bc.chain});
});

//get latest data from the blockchain
app.get("/block-data", (req, res)=>{
	res.render("block", { msg: bc.chain[bc.chain.length - 1]});
});

//user query
app.get("/query", (req, res)=>{
	console.log(req.query);
	let msg = null;
	let sensor = null;
	if (req.query.location === "x"){
		sensor = "dht";
		msg = ( fb.data.dht.temperature > 20) ? "OK" : "NOT Advisable";
	}else if (req.query.location === "y"){
		sensor = "smoke";
		msg = ( fb.data.smoke.value < 700 ) ? "OK" : "NOT Advisable";
	}
	res.render("feedback", { msg, feedback: true , sensor });
});

app.post("/feedback", (req, res)=>{
	const { sensor, trust } = req.body;
	res.render("msg", { msg: "Thank for your valuable feedback."});
	if (sensor === "dht"){
		if (trust === "false")
			(fb.data.dht.trust > 1) ? (fb.data.dht.trust--):null;
		else	
			(fb.data.dht.trust < 10) ? (fb.data.dht.trust++):null;
	}else{
		if (trust === "false")
			(fb.data.smoke.trust > 1) ? (fb.data.smoke.trust--):null;
		else	
			(fb.data.smoke.trust < 10) ? (fb.data.smoke.trust++):null;
	}
	p2pServer.broadcastFeedback(fb.data);
});

//Get data dht sensor data
app.post("/smoke-data", (req, res)=>{
	fb.data.smoke.value = Number(req.body.data);
	console.log(req.body.data);
	res.json({msg: "Smoke sensor data received"});
	p2pServer.broadcastFeedback(fb.data);
});

//Getting data and mine to the blockchain
/*app.post('/mine', (req, res)=>{
	const nwBlock = bc.addBlock(req.body.data);
	console.log(`New block added  ${nwBlock.toString()}`);
	p2pServer.syncChain();
	res.status(302).redirect('/blocks');
});*/

setInterval(()=> {
	if (process.env.DEVICE === "RPI"){
		const sensor = require("node-dht-sensor");
		sensor.read(11, 26, function(err, temperature, humidity) {
			if (!err) {
				console.log(`Temperature: ${temperature}°C, Humidity: ${humidity}%`);
				fb.data.dht.temperature = temperature;
				fb.data.dht.humidity = humidity;
			}
		});
		p2pServer.broadcastFeedback(fb.data);
	}
	const nwBlock = bc.addBlock(fb.data);
	console.log(`New block added  ${nwBlock.toString()}`);
	p2pServer.syncChain();
}, 60000);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

p2pServer.listen();
app.listen(HTTP_PORT, () => console.log(`Listening HTTP request on Port ${HTTP_PORT}`));