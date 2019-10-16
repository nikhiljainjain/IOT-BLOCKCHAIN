const WebSocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPE = {
    chain: 'CHAIN',
    feedback: 'FEEDBACK'
};

class P2pServer {

    constructor(blockchain, feedback) {
        this.blockchain = blockchain;
        this.feedback = feedback;
        this.sockets = [];
    }

    listen() {
        const server = new WebSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeer();
        console.log(`Listen for P2P connection on port ${P2P_PORT}`);
    }

    connectToPeer() {
        peers.forEach(peer =>{
            const socket = new WebSocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Connection established');

        this.messageHandler(socket);
        this.sendChain(socket);
    }

    sendChain(socket) {
        socket.send(JSON.stringify({ type: MESSAGE_TYPE.chain, chain: this.blockchain.chain }));
    }

    sendFeedback(socket, feedback) {
        socket.send(JSON.stringify({ type: MESSAGE_TYPE.feedback, feedback }));
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MESSAGE_TYPE.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPE.feedback:
                    this.feedback.replaceData(data.feedback);
                    break;
            } 
        });
    }

    broadcastFeedback(feedback) {
        this.sockets.forEach(socket => {
            this.sendFeedback(socket, feedback);
        });
    }

    syncChain() {
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }
}

module.exports = P2pServer;