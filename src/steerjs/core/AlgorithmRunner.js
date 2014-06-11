/****
 * @class AlgorithmRunner
 * @param config
 * @param context
 * @constructor
 */
steerjs.AlgorithmRunner = function(config, context){
    this.config = config;
    this.context = context;
    this.$injector = new steerjs.Injector();
};

steerjs.AlgorithmRunner.prototype.setContext = function(context){
  this.context = context;
};

steerjs.AlgorithmRunner.prototype.setConfig = function(config){
    this.config = config;
};

steerjs.AlgorithmRunner.prototype.setInjector = function($injector){
    this.$injector.extend($injector);
};

steerjs.AlgorithmRunner.prototype.constructor = steerjs.AlgorithmRunner;

/***
 * Accumulate force from algo lists
 * @returns {steerjs.Vector}
 */
steerjs.AlgorithmRunner.prototype.run = function(){
    var acc = new steerjs.Vector(0,0);
    for(var algoNum in this.config['algo']){
        var currentAlgo = this.config['algo'][algoNum];
        var result = this.runAlgo(currentAlgo);
        if(result != undefined || result != null){
            acc.add(result);
        }
    }
    return acc;
};

/***
 * Run algorithm from config
 * @param algo example: { name: 'steer', params: {alfa: 10} }
 * @returns {steerjs.Vector}
 */
steerjs.AlgorithmRunner.prototype.runAlgo = function(algo){
    for (var key in this.context) {
        this.$injector.register(key, this.context[key]);
    }
    var params = algo['params'];
    for(key in params){
        this.$injector.register(key,params[key]);
    }
    return this.$injector.resolve(this.$injector.get(algo.name), this.$injector);
};