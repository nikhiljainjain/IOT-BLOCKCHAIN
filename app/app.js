let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

const P2pServer = require('./p2p-server');
const Blockchain = require('../blockchain');

let bc = new Blockchain();
let p2pServer = new P2pServer(bc);
let data = {
	smoke: {
		value: 685,
		trust: 10
	},
	
	dht: {
		temperature: 14,
		humidity: 65,
		trust: 10
	}
};

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
    res.render('index');
});

//it sends complete block chain
app.get('/blocks', (req, res)=>{
	res.json(bc.chain);
});

//get latest data from the blockchain
app.get("/block-data", (req, res)=>{
	res.json({data: bc.chain[bc.chain.length - 1]});
});

//user query
app.get("/query", (req, res)=>{
	console.log(req.query);
	let msg =  null;
	if (req.query.location === "x"){
		msg = ( data.dht.temperature > 30) ? "OK" : "NOT ADVISED";
	}else if (req.query.location === "y"){
		msg = ( data.smoke.value < 700 ) ? "OK" : "NOT ADVISED";
	}
	res.json({ msg });
});

app.post("/feedback", (req, res)=>{
	const { sensor, trust } = req.body;
	res.json({ msg: "Thank for your valuable feedback."});
	if (sensor === "dht"){
		if (trust === "false")
			(data.dht.trust > 1) ? (data.dht.trust--):null;
		else	
			(data.dht.trust < 10) ? (data.dht.trust++):null;
	}else{
		if (trust === "false")
			(data.smoke.trust > 1) ? (data.smoke.trust--):null;
		else	
			(data.smoke.trust < 10) ? (data.smoke.trust++):null;
	}
});

//Get data dht sensor data
app.post("/smoke-data", (req, res)=>{
	data.smoke.value = (Math.random());//req.body.data;
	console.log(req.body);
	if (process.env.DEVICE === "RPI"){
		sensor.read(11, 26, function(err, temperature, humidity) {
			if (!err) {
				console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
				data.dht.temperature = temperature;
				data.dht.humidity = humidity;
			}
		});
	}
	res.json({msg: "Smoke sensor data received"});
});

//Getting data and mine to the blockchain
/*app.post('/mine', (req, res)=>{
	const nwBlock = bc.addBlock(req.body.data);
	console.log(`New block added  ${nwBlock.toString()}`);
	p2pServer.syncChain();
	res.status(302).redirect('/blocks');
});*/

setInterval(()=> {
	const nwBlock = bc.addBlock(data);
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