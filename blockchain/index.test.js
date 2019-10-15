const Block = require('./block');
const Blockchain = require('./index');

describe('Blockchain', ()=>{
    let bc, bc2;
    
    beforeEach(()=>{
        bc = new Blockchain();
        bc2 = new Blockchain();
    });
    
    it('Checking genesis block', ()=>{
        expect(bc.chain[0]).toEqual(Block.genesis());
    });
    
    it('Adding new block to the chain', ()=>{
        const data = "Unknown";
        bc.addBlock(data);
        
        expect(bc.chain[bc.chain.length-1].data).toEqual(data);
    });

    it('Validity of block-chain', ()=>{
        bc2.addBlock("Unknown");

        expect(bc.isValidChain(bc2.chain)).toBe(true);
    });

    it('Invalidity of genesis block of chain', ()=>{
        bc.chain[0].data = "error";

        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });

    it('invalidity of chain block', ()=>{
        bc2.addBlock("Unknown");
        bc2.chain[1].data = "error";

        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });

    it('Validity new chain with length greater than original chain', ()=>{
        bc2.addBlock('first block');
        bc2.addBlock('second block');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).toEqual(bc2.chain);
    });

    it('Invalidity new chain with lenght less or equal to existing chain', ()=>{
        bc.addBlock("first block");
        bc.addBlock("second block");
        bc.replaceChain(bc2.chain);

        expect(bc.chain).not.toEqual(bc2.chain);
    });

});