/***
 * @class EventHandler
 * It's used to handle game events, which was configured in config
 * @constructor
 */
steerjs.EventHandler = function(){
    this.event = null;
    this.algoRunner = null;
    this.handler = {};
};

steerjs.EventHandler.prototype.constructor = steerjs.EventHandler;

steerjs.EventHandler.prototype.addAlgoRunner = function(runner){
    this.algoRunner = runner;
};
/***
 * Fire event
 * @param name
 * @param context
 * @returns {steerjs.Vector|null}
 */
steerjs.EventHandler.prototype.fire = function(name, context){
    this.event = name;
    var handlerInfo = this.handler[this.event] || null;
    if(handlerInfo == null){
        console.log("Event handler for " + this.event + " is empty");
        return null;
    }else{
        this.algoRunner.setConfig(handlerInfo);
        this.algoRunner.setContext(context);
        return  this.algoRunner.run();
    }
};

/***
 * This method used in config
 * @param name {String} - name of events
 * @param config {object}, example { algo: [{name: 'steer', params: {alfa: 10}}, {...}]}
 */
steerjs.EventHandler.prototype.on = function(name, config){
    this.handler[name] = config;
};


