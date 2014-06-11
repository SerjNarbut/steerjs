/**
 * Created by SerjNarbut on 22.05.2014.
 */
/***
 * @class Injector
 * @constructor
 */
steerjs.Injector = function () {
    this.dependencies = {};
    this.services = {};
    var self = this;
    this.servicesInjector = steerjs.createInnerInjector(this.services, function (serviceName) {
        throw new Error("Cant inject " + serviceName);
    });
    this.dependencyInjector = steerjs.createInnerInjector(this.dependencies, function (serviceName) {
        var service = self.servicesInjector.get(serviceName);
        if(steerjs.isArray(service) || steerjs.isFunction(service)){
            return self.dependencyInjector.resolve(service);
        }else{
            return service;
        }
    });
};

steerjs.Injector.prototype = steerjs.Injector;

/***
 * Defined new value for IoC
 * @param name {String}
 * @param dependency
 */
steerjs.Injector.prototype.register = function (name, dependency) {
    this.dependencies[name] = dependency;
};

steerjs.Injector.prototype.registerService = function (name, service) {
    this.services[name] = service;
};

steerjs.Injector.prototype.registerConstant = function (name, value) {
    if(this.services.hasOwnProperty(name)){
        throw new Error("Constant " + name + " already defined");
    }
    this.services[name] = value;
};

/***
 * Deleted dependency by name
 * @param name {String}
 */
steerjs.Injector.prototype.unregister = function (name) {
    if (this.dependencies.hasOwnProperty(name)) {
        delete this.dependencies[name];
    }
    if(this.services.hasOwnProperty(name)){
        delete this.services[name];
    }
    if(this.services.hasOwnProperty(name + steerjs.servicePrefix)){
        delete this.services[name + steerjs.servicePrefix];
    }
};

steerjs.Injector.prototype.canResolve = function (name) {
    return this.dependencies.hasOwnProperty(name) || this.services.hasOwnProperty(name) || this.services.hasOwnProperty(name + steerjs.servicePrefix);
};

/***
 * Return dependency by name
 * @param name
 * @returns {*|null}
 */
steerjs.Injector.prototype.get = function (name) {
    if (steerjs.debug) {
        console.log("Resolving dependency " + name);
    }
    if (this.canResolve(name)) {
        return this.dependencies[name];
    }
    return null;
};

/***
 * Delete all dependencies
 */
steerjs.Injector.prototype.clear = function () {
    delete this.dependencies;
    this.dependencies = {};
};

/***
 * Inject dependencies in function and call it
 * Examples:
 *      injector.reslove(['alfa', 'beta', function(param1, param2){ ... } ])
 *      injector.resolve(function(alfa, beta){ ... })
 * If dependencies name is first argument, they'll be injected in the function by array order,
 * else array of dependencies will be resolved from function arguments name.
 * All dependencies must be registered before they'll be injected
 * @returns {*}
 */
steerjs.Injector.prototype.resolve = function (fn) {
    var scope = {};
    if (steerjs.isArray(fn)) {
        for (var i = 0; i < fn.length; i++) {
            if (steerjs.isObject(fn[i])) {
                scope = fn[i];
            }
        }
    }
    return this.dependencyInjector.resolve(fn, scope || {});
};

steerjs.Injector.prototype.extend = function (otherInjector) {
    this.dependencies = steerjs.extend(this.dependencies, otherInjector.dependencies);
    this.services = steerjs.extend(this.services, otherInjector.services);
};

/***
 * Returns ordered names dependencies
 * @param fn {Array|Function}
 * @returns {Array}
 */
steerjs.getDependencies = function (fn) {
    var $inject = [];
    if (steerjs.isFunction(fn)) {
        if (fn.$inject == undefined) {
            var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
            var deps = fn.toString().match(FN_ARGS)[1].replace(/ /g, "").split(",");
            for (i = 0; i < deps.length; i++) {
                if(deps[i] != ""){
                    $inject.push(deps[i]);
                }
            }
            fn.$inject = $inject;
        } else {
            $inject = fn.$inject;
        }
    } else if (steerjs.isArray(fn)) {
        for (var i = 0; i < fn.length; i++) {
            if (steerjs.isString(fn[i])) {
                $inject.push(fn[i]);
            }
        }
        fn.$inject = $inject;
    }
    return $inject;
};

/***
 * Returns inner injector, which try to resolve all dependencies
 * @param cache {Object} Hasmap of dependencies
 * @param notFoundFnct {Function} not found dependency handler
 * @returns {{get: getService, resolve: resolve}}
 */
steerjs.createInnerInjector = function (cache, notFoundFnct) {
    function getService(serviceName) {
        if (cache.hasOwnProperty(serviceName)) {
            return cache[serviceName];
        } else if(cache.hasOwnProperty(serviceName + steerjs.servicePrefix)){
            return cache[serviceName + steerjs.servicePrefix];
        } else {
            try{
                cache[serviceName] = notFoundFnct(serviceName);
                return cache[serviceName];
            }catch (err){
                delete cache[serviceName];
                throw err;
            }
        }
    }

    function resolve(fnc, scope) {
        var args = [];
        var $inject = steerjs.getDependencies(fnc);
        for(var i =0 ; i < $inject.length; i++){
            if(cache.hasOwnProperty($inject[i])){
                args.push(cache[$inject[i]]);
            }else{
                args.push(getService($inject[i]));
            }
        }
        if(steerjs.isArray(fnc)){
            fnc = fnc[fnc.length - 1];
        }
        return fnc.apply(scope,args);
    }

    return{
        get: getService,
        resolve: resolve
    }

};