/**
 * Created by SerjNarbut on 22.05.2014.
 */
/***
 * @class Module
 * @param name {string} the uniq name of module
 * @param injector {steerjs.Injector}
 * @constructor
 */
steerjs.Module = function (name, injector) {
    this.name = name;
    this.$injector = injector;
    this.$handler = new steerjs.EventHandler();
    this.$injector.register("$handler",this.$handler);
    this.isBoot = false;
};
steerjs.Module.prototype.constructor = steerjs.Module;

/***
 * Defines new constant
 * @param name {string}
 * @param value {Object|Number|String|Array} value of constant
 * @returns {steerjs.Module}
 */
steerjs.Module.prototype.constant = function (name, value) {
    if(this.isBoot){
        throw new Error("Module " + name + " already initialized");
    }
    if(steerjs.isFunction(value)){
      throw new Error("Constant" + name + " couldn't be a function");
    }
    if(!this.$injector.canResolve(name)){
        this.$injector.registerConstant(name, value);
    }else{
        console.log("Try to redefined constant " + name);
    }
    return this;
};

/***
 * Defined new algorithm implementation.
 * This algorithm able to use only current module
 * @returns {steerjs.Module}
 */
steerjs.Module.prototype.algorithm = function () {
    if(this.isBoot){
        throw new Error("Module " + name + " already initialized");
    }
    var name = arguments[0];
    var impl = null;
    if (steerjs.isString(name)) {
        if (arguments.length == 2) {
            impl = arguments[1];
        } else {
            throw new Error("Cannot find " + name + " implementation");
        }

        if(steerjs.isArray(impl)){
            var $inject = steerjs.getDependencies(impl);
            impl = impl[impl.length - 1];
            impl.$inject = $inject;
        }

        this.$injector.register(name, impl);
    }
    return this;
};

/***
 *
 * @param name {string} name of service
 * @param impl {function} service implementation
 * Note: service is singleton
 * @returns {steerjs.Module}
 */
steerjs.Module.prototype.service = function (name, impl) {
    if(this.isBoot){
        throw new Error("Module " + name + " already initialized");
    }
    if(!steerjs.contains(name, steerjs.servicePrefix)){
        name += steerjs.servicePrefix;
    }
    this.$injector.registerService(name, impl);
    return this;
};

/***
 * Set event handler config
 * @returns {steerjs.Module}
 */
steerjs.Module.prototype.handlerConfig = function () {
    if(this.isBoot){
        throw new Error("Module " + name + " already initialized");
    }
    if(arguments == undefined || arguments == null){
        throw new Error("Config event handler function is empty");
    }
    this.$injector.resolve(arguments[0], this);
    return this;
};

/***
 * Returns event handler
 * @returns {steerjs.EventHandler|*}
 */
steerjs.Module.prototype.handler = function(){
    return this.$handler;
};

/***
 * Try to resolve function and return result
 * @param fn {Function | Array}
 * @returns {*}
 */
steerjs.Module.prototype.run = function(fn){
  return this.$injector.resolve(fn);
};

/***
 *
 * @param name {String}
 * @param value {Object|Number|String|Array}
 * @returns {steerjs.Module}
 */
steerjs.Module.prototype.value = function(name, value){
    if(this.isBoot){
        throw new Error("Module " + name + " already initialized");
    }
    if(!steerjs.isFunction()){
        this.$injector.register(name,value);
    }else{
       throw new Error("Value" + name + " couldn't be a function");
    }
    return this;
};

steerjs.Module.prototype.boot = function(){
    this.$runner = new steerjs.AlgorithmRunner();
    this.$runner.setInjector(this.$injector);
    this.$handler.addAlgoRunner(this.$runner);
    this.$injector.register("$handler",this.$handler);
    this.isBoot = true;
};