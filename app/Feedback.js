class Feedback{

    constructor(){
        this.data = {
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
    }

    replaceData(data){
        console.log('New feedback data updated');
        this.data = data;
    }
}

module.exports = Feedback;