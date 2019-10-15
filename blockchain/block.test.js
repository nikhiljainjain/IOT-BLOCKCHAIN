const Block = require("./block");

describe('block', ()=>{
    let block, lastBlock, data;
    
    beforeEach(()=>{
        data = 'Hello Unknown';
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock, data);
    });
    
    it('sets the `data` match to input data', ()=>{
        expect(block.data).toEqual(data);
    });
    
    it('sets the `lastHash` match to hash of last block hash', ()=>{
        expect(block.lastHash).toEqual(lastBlock.hash);
    });

    it('generate a hash that matches the difficulty', ()=>{
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    });

    it('lowering the difficulty level when mining slow', ()=>{
        expect(Block.adjustDifficulty(block, block.timestamp+5600)).toEqual(block.difficulty-1);
    });

    it('raising the difficulty level when mining too fast', ()=>{
        expect(Block.adjustDifficulty(block, block.timestamp+1)).toEqual(block.difficulty+1);
    });
});