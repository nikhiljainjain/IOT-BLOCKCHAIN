const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block
{
    constructor(timestamp, lastHash, hash, data, nonce, difficulty){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString(){
        return `Block -
        Time Stamp : ${this.timestamp}
        Last Hash  : ${this.lastHash.substring(0, 10)}
        Hash       : ${this.hash.substring(0, 10)}
        Nonce      : ${this.nonce}
        Data       : ${this.data}
        Difficulty : ${this.difficulty}
        `;
    }
    
    static genesis() {
        return new this("Genesis Block", '------', 'f1r5t block', [], 0, DIFFICULTY);
    }
    
    static mineBlock(lastBlock, data) {
        const lastHash = lastBlock.hash;
        let nonce = 0;
        let { difficulty } = lastBlock;
        let timestamp, hash;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        } while (hash.substr(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lastHash, hash, data, nonce, difficulty);
    }
    
    static hash(timestamp, lastHash, data, nonce, difficulty) {
        return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static genHash(block) {
        const {timestamp, data, lastHash, nonce, difficulty} = block;
        return  Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty+1 : difficulty-1;
        return difficulty;
    }
}

module.exports = Block;