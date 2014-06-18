/**
 * @license
 * steerjs - v0.1.1
 * Copyright (c) 2014, Serj Narbut
 *
 * Compiled: 2014-06-18
 *
 * steerjs is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(){
    'use strict';
    var root = this;

/***
 * Module STEERJS
 * @type {steerjs}
 */
var steerjs = steerjs || {};


steerjs.version = "v0.1.0";

steerjs.debug = false;

steerjs.servicePrefix = "Service";

steerjs.Random = function(min, max){
    return Math.random() * (max - min) + min;
};

steerjs.RandomInt = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
/***
 * Simple javascript inheritance
 * @param child {function}
 * @param parent {function}
 */
steerjs.extendClass = function(child, parent){
    var tmp = function() {};
    tmp.prototype = parent.prototype;
    child.prototype = new tmp();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
};


steerjs.isFunction = function(value){
    return typeof value == "function";
};

steerjs.isObject = function(value){
    return typeof value == "object";
};

steerjs.isString = function(value){
    return typeof value == "string";
};
steerjs.isArray = function(value){
    return toString.call(value) == "[object Array]";
};

/***
 * Extends first arguments from other arguments
 * @returns {*}
 */
steerjs.extend = function(){
    var currObject = arguments[0];

    var ext = function(dest, source){
        for(var key in source){
            dest[key] = source[key];
        }
        return dest;
    };

    for(var i = 1; i < arguments.length;i++){
        currObject = ext(currObject, arguments[i]);
    }

    return currObject;
};

/***
 * Contains search string in source string
 * @param source {string}
 * @param search {string}
 * @returns {boolean}
 */
steerjs.contains = function(source, search){
    var tmp_source = source.toLowerCase();
    var tmp_search = search.toLowerCase();
    var index = tmp_source.indexOf(tmp_search);
    return index != -1;
};

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
        var ans =  this.dependencies[name];
        if(ans == undefined){
            ans = this.services[name];
        }
        if(ans == undefined){
            ans = this.services[name+"Service"];
        }
        return ans;
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
/***
 * Implementation of the seek algorithm
 * @param unit
 * @param goal {steerjs.Vector}
 * @param alfa {Number}
 * @returns {steerjs.Vector}
 */
steerjs.seek = function (unit, goal, alfa) {
    var desiredVelocity = steerjs.Vector.minus(goal, unit.location);
    desiredVelocity.normalize();
    desiredVelocity.multiScalar(unit.maxSpeed);
    var seek = steerjs.Vector.minus(desiredVelocity, unit.velocity);
    seek.multiScalar(alfa);
    return seek;
};

steerjs.seek.$inject = ['unit','goal','alfa'];

/***
 * Implementation of the flee algorithm
 * @param unit
 * @param goal {steerjs.Vector}
 * @param alfa {Number}
 * @returns {steerjs.Vector}
 */
steerjs.flee = function (unit, goal, alfa) {
    var seek = steerjs.seek(unit, goal, alfa);
    seek.multiScalar(-1);
    return seek;
};
steerjs.flee.$inject = ['unit','goal','alfa'];


steerjs.pursuit = function(unit, leader, alfa){
    var future = steerjs.Vector.distance(unit.location, leader.location) / unit.maxSpeed;
    var futurePosition = steerjs.Vector.add(leader.location, steerjs.Vector.multipleScalar(leader.velocity, future));
    return steerjs.seek(unit,futurePosition, alfa);
};
steerjs.pursuit.$inject = ['unit','leader', 'alfa'];

steerjs.evade = function(unit, leader, alfa){
    var future = steerjs.Vector.distance(unit.location, leader.location) / unit.maxSpeed;
    var futurePosition = steerjs.Vector.add(leader.location, steerjs.Vector.multipleScalar(leader.velocity, future));
    return steerjs.flee(unit,futurePosition, alfa);
};
steerjs.evade.$inject = ['unit','leader', 'alfa'];

/***
 * Implementation of the arrival algorithm
 * @param unit
 * @param goal {steerjs.Vector}
 * @param closestsRadius {Number}
 * @param alfa {Number}
 * @returns {steerjs.Vector}
 */
steerjs.arrival = function (unit, goal, closestsRadius, alfa) {
    if(alfa > 1){
        throw new Error("For arrival algo alfa must be less or equals than 1, but current alfa is " + alfa);
    }
    var desiredVelocity = steerjs.Vector.minus(goal,unit.location);
    var distance = desiredVelocity.length();

    if (distance < closestsRadius) {
        desiredVelocity.normalize();
        desiredVelocity.multiScalar(unit.maxSpeed);
        desiredVelocity.multiScalar(distance / closestsRadius);
    } else {
        desiredVelocity.normalize();
        desiredVelocity.multiScalar(unit.maxSpeed);
    }

    var steering = steerjs.Vector.minus(desiredVelocity, unit.velocity);
    steering.multiScalar(alfa);
    return steering;
};
steerjs.arrival.$inject = ['unit','goal','closestsRadius','alfa'];

/***
 * Separate algorithm
 * @param unit current unit
 * @param units {Array}
 * @param separateRadius {Number} radius for separate units each other
 * @param alfa {Number}
 * @returns {steerjs.Vector}
 */
steerjs.separate = function (unit, units, separateRadius, alfa) {
    var sum = steerjs.Vector.zero();
    var count = 0;
    for(var i in units){
        if( unit != units[i]){
            var distance =  steerjs.Vector.distance(unit.location, units[i].location);
            if(distance <= separateRadius){
                sum.add(units[i].location.between(unit.location));
                if(distance > 0){
                    sum.divScalar(distance);
                }
                count++;
            }
        }
    }
    if(count > 0){
        sum.divScalar(count);
        sum.multiScalar(-1);
        sum.normalize();
        sum.multiScalar(alfa);
    }
    return sum;
};
steerjs.separate.$inject = ['unit','units','separateRadius','alfa'];
/***
 * Align algorithm
 * @param unit
 * @param units {Array}
 * @param alignRadius {Number}
 * @param alfa {Number}
 * @returns {steerjs.Vector}
 */
steerjs.align = function(unit, units, alignRadius, alfa){
    var sum = steerjs.Vector.zero();
    var count = 0;
    for(var i in units ){
        if(units[i] != unit){
            var distance = steerjs.Vector.distance(unit.location, units[i].location);
            if(distance > 0 && distance <= alignRadius){
                sum.add(units[i].velocity);
                count++;
            }
        }
    }
    if(count > 0) {
        sum.divScalar(count);
        sum.normalize();
        sum.multiScalar(alfa);
    }
    return sum;
};
steerjs.align.$inject = ['unit','units','alignRadius','alfa'];

/***
 * Cohesion algorithm
 * Keeps a group of units together
 * @param unit {Object}
 * @param units {Array}
 * @param cohesionRadius {Number}
 * @param alfa {Number}
 * @returns {steerjs.Vector}
 */
steerjs.cohesion = function(unit, units, cohesionRadius, alfa){
    var sum = steerjs.Vector.zero();
    var count = 0;
    for(var i in units ){
        if(units[i] != unit){
            var distance = steerjs.Vector.distance(unit.location, units[i].location);
            if(distance > 0 && distance <= cohesionRadius){
                sum.add(units[i].location);
                count++;
            }
        }
    }
    if(count > 0) {
        sum.divScalar(count);
        sum.minus(unit.location);
        sum.normalize();
        sum.multiScalar(alfa);
    }
    return sum;
};
steerjs.cohesion.$inject = ['unit','units','cohesionRadius','alfa'];

/***
 * Fast combination of separate, align and cohesion
 * This algoritm simulate group moving
 * @param unit {Object}
 * @param units {Array}
 * @param sepRadius {Number}
 * @param cohRadius {Number}
 * @param alignRadius {Number}
 * @param alfaSep {Number}
 * @param alfaCoh {Number}
 * @param alfaAlign {Number}
 * @param alfa {Number}
 * @returns {*}
 */
steerjs.flocking = function(unit, units, sepRadius, cohRadius, alignRadius, alfaSep, alfaCoh, alfaAlign, alfa){
    var sepSum = steerjs.Vector.zero();
    var cohSum = steerjs.Vector.zero();
    var alignSum = steerjs.Vector.zero();

    var sepCount = 0;
    var cohCount = 0;
    var alignCount = 0;

    for(var i in units){
        if(units[i] != unit){
            var distance = steerjs.Vector.distance(unit.location, units[i].location);
            if(distance <= separateRadius){
                sepSum.add(units[i].location.between(unit.location));
                if(distance > 0){
                    sum.divScalar(distance);
                }
                sepCount++;
            }
            if(distance > 0 && distance <= alignRadius){
                alignSum.add(units[i].velocity);
                alignCount++;
            }
            if(distance > 0 && distance <= cohesionRadius){
                cohSum.add(units[i].location);
                cohCount++;
            }
        }
    }

    if(sepCount > 0){
        sepSum.divScalar(sepCount);
        sepSum.multiScalar(-1);
        sepSum.normalize();
        sepSum.multiScalar(alfaSep);
    }
    if(alignCount > 0) {
        alignSum.divScalar(alignCount);
        alignSum.normalize();
        alignSum.multiScalar(alfaAlign);
    }
    if(cohCount > 0) {
        cohSum.divScalar(cohCount);
        cohSum.minus(unit.location);
        cohSum.normalize();
        cohSum.multiScalar(alfaCoh);
    }

    var sum = steerjs.Vector.add(sepSum, steerjs.Vector.add(cohSum, alignSum));
    sum.multiScalar(alfa);
    return sum;
};
steerjs.flocking.$inject = ['unit', 'units', 'sepRadius', 'cohRadius', 'alignRadius', 'alfaSep', 'alfaCoh', 'alfaAlign', 'alfa'];

/***
 * Leader Following implementation
 * @param unit {Object}  current unit
 * @param leader {Object} leader unit
 * @param units {Array}
 * @param leaderDistance {Number} Max distance between units and leader
 * @param sightRadius {Number} -radius of view of leader.
 * @param sepRadius {Number} radius of separate units in group
 * @param alfaSep {Number}
 * @param alfa {Number}
 */
steerjs.leaderFollowing = function(unit, leader, units, leaderDistance, sightRadius, sepRadius, alfaSep, alfa){
    var sum = steerjs.separate(unit,units, sepRadius, alfaSep);
    var speed = leader.velocity.clone();
    speed.normalize();
    speed.multiScalar(leaderDistance);
    var ahead = leader.location.clone().add(speed);
    speed.multiScalar(-1);
    var behind = leader.location.clone().add(speed);

    if(onLeaderSight(ahead)){
        sum.add(steerjs.evade(unit,leader.location,1));
    }
    sum.add(steerjs.arrival(unit,behind,leaderDistance,1));
    sum.add(steerjs.separate(unit,units,sepRadius,alfaSep));
    sum.multiScalar(alfa);

    return sum;

    function onLeaderSight(position){
        return steerjs.Vector.distance(position, unit.location) <= sightRadius || steerjs.Vector.distance(leader.location, unit.location) <= sightRadius;
    }

};
steerjs.leaderFollowing.$inject = ['unit','leader','units', 'leaderDistance', 'sightRadius', 'sepRadius', 'alfaSep', 'alfa'];

steerjs.pathFollowing = function(unit, path, readius, alfa){
    if (path != null){
        var target = path[unit.wayPointIndex];
        if(steerjs.Vector.distance(unit.location, target) < readius){
            unit.wayPointIndex++;
            if(unit.wayPointIndex > radius.length){
                unit.wayPointIndex = null;
            }
        }
        if(unit.wayPointIndex != null){
            target  = path[unit.wayPointIndex];
            return steerjs.seek(unit,target, alfa);
        }else{
            return steerjs.Vector.zero();
        }
    }else{
        return steerjs.Vector.zero();
    }
};
steerjs.pathFollowing.$inject = ['unit','path','radius','alfa'];

steerjs.collisionAvoidance = function(unit, obstacles, maxAhead, alfa){
    var tempVelocity = unit.velocity.clone();
    tempVelocity.normalize();
    tempVelocity.multiScalar(maxAhead * unit.velocity.length() / unit.maxSpeed);

    var ahead = unit.location.clone();
    ahead.add(tempVelocity);
    tempVelocity.multiScalar(0.5);
    var aheadTwo = unit.location.clone();
    aheadTwo.add(tempVelocity);
    function intersetcWithCircle(ahead, aheadTwo, circle){
        return steerjs.Vector.distance(circle.center,ahead) <= circle.radius || steerjs.Vector.distance(circle.center, aheadTwo) <= circle.radius;
    }

    function getClosestsCircle(){
        var findCircle = null;
        var len = obstacles.length;
        for(var i =0; i < len; i++){
            var obstacle = obstacles[i];
            var hasCollision = intersetcWithCircle(ahead, aheadTwo, obstacle);
            if(hasCollision && ( findCircle == null || steerjs.Vector.distance(unit.location, obstacle) < steerjs.Vector.distance(unit.loction, findCircle))){
                findCircle = obstacle;
            }
        }
        return obstacle;
    }

    var steerForce= steerjs.Vector.zero();
    var findedCircle = getClosestsCircle();
    if(findedCircle != null){
        var force = steerjs.Vector.minus(ahead, findedCircle.center);
        force.normalize();
        force.multi(alfa);
        return force;
    }else{
        return steerjs.Vector.zero();
    }
};

/***
 * @class Vector
 * Implementation of 2d float vector <x,y>
 * @param x  coordinate
 * @param y coordinate
 * @constructor
 */
steerjs.Vector = function(x,y){
    this.x = x || 0;
    this.y = y || 0;
};

steerjs.Vector.prototype.constructor = steerjs.Vector;


steerjs.Vector.prototype.clone = function(){
    return new steerjs.Vector(this.x, this.y);
};

/***
 *  Add other vector to current and modify current vector
 * @param otherVector {steerjs.Vector}
 */
steerjs.Vector.prototype.add = function(otherVector){
    this.x += otherVector.x;
    this.y += otherVector.y;
};

/***
 *  Minus other vector from current and modify current vector
 * @param otherVector {steerjs.Vector}
 */
steerjs.Vector.prototype.minus = function(otherVector){
    this.x -= otherVector.x;
    this.y -= otherVector.y;
};

/***
 * Multiple current vector on a scalar number
 * @param scalar {Number}
 */
steerjs.Vector.prototype.multiScalar = function(scalar){
    this.x *= scalar;
    this.y *= scalar;
};

steerjs.Vector.prototype.divScalar = function(scalar){
  this.x /= scalar;
  this.y /= scalar;
};

/***
 * Scalar multiple of two vectors
 * @param otherVector {steerjs.Vector}
 * returns {Number} result of multiple
 */
steerjs.Vector.prototype.multiple = function(otherVector){
    return this.x * otherVector.x + this.y * otherVector.y;
};

/***
 * Returns Vector from current to other
 * @param otherVector {steerjs.Vector}
 * @returns {steerjs.Vector}
 */
steerjs.Vector.prototype.between = function(otherVector){
    return steerjs.Vector.minus(this,otherVector)
};

steerjs.Vector.prototype.length = function(){
    return Math.sqrt(this.lengthNonSqrt());
};

steerjs.Vector.prototype.lengthNonSqrt = function(){
    return this.x * this.x + this.y * this.y;
};

steerjs.Vector.prototype.normalize = function(){
    var len = this.length();
    if(len != 0){
        this.x /= len;
        this.y /= len;
    }
};

/***
 * Limit vector length to max, if length > max
 * @param max {Number}
 */
steerjs.Vector.prototype.limit = function(max){
    var len = this.length();
    if(len > max && len != 0){
        this.x /= len;
        this.y /= len;

        this.multiScalar(max);
    }
};

/***
 * Returns projection of current vector to at other vector
 * @param otherVector {steerjs.Vector}
 * @returns {steerjs.Vector}
 */
steerjs.Vector.getProjectionOn = function(otherVector){
    otherVector.normalize();
    otherVector.multiScalar(steerjs.Vector.multiple(this,otherVector));
    return otherVector;
};

steerjs.Vector.prototype.equals = function(otherVector){
    return this.x == otherVector.x && this.y == otherVector.y;
};



/* Static methods*/

steerjs.Vector.add = function(vectorOne, vectorTwo){
    return new steerjs.Vector(vectorOne.x + vectorTwo.x, vectorOne.y + vectorTwo.y );
};

steerjs.Vector.minus = function(vectorOne, vectorTwo){
    return new steerjs.Vector(vectorOne.x - vectorTwo.x, vectorOne.y - vectorTwo.y );
};

/***
 *
 * @param vectorOne {steerjs.Vector} first point
 * @param vectorTwo {steerjs.Vector} second point
 * @returns {Number} distance between two point
 */
steerjs.Vector.distance = function(vectorOne, vectorTwo){
    var dVector = steerjs.Vector.minus(vectorOne,vectorTwo);
    return dVector.length();
};

/***
 * Scalar multiple of two vectors
 * @param vectorOne {steerjs.Vector}
 * @param vectorTwo {steerjs.Vector}
 * returns {Number} result of multiple
 */
steerjs.Vector.multiple = function(vectorOne, vectorTwo){
    return vectorOne.x * vectorTwo.x + vectorOne.y * vectorTwo.y;
};

steerjs.Vector.multipleScalar = function(vectorOne, scalar){
    var res = vectorOne.clone();
    res.multiScalar(scalar);
    return res;
};

steerjs.Vector.multipleVector = function(vectorOne, vectorTwo){
    return vectorOne.x * vectorTwo.y - vectorOne.y * vectorTwo.x;
};

/***
 * Returns angle between two vectors
 * @param vectorOne {steerjs.Vector}
 * @param vectorTwo {steerjs.Vector}
 * @returns {number}
 */
steerjs.Vector.angleBetween = function(vectorOne, vectorTwo){
    vectorOne.normalize();
    vectorTwo.normalize();

    return Math.acos(Vector.multiple(vectorOne,vectorTwo));
};

/***
 * Returns normal from point p to line <startP, endP>
 * @param startP {steerjs.Vector} start of line
 * @param endP {steerjs.Vector} end of line
 * @param p {steerjs.Vector} point
 * @returns {steerjs.Vector} normal
 */
steerjs.Vector.getNormalPoint = function(startP, endP, p){
    var start_p = p.between(startP);
    var line = endP.between(start_p);

    line.normalize();
    line.multiScalar(line.multiple(start_p));

    return steerjs.Vector.add(start_p, line);
};

steerjs.Vector.pointOnLine = function(start,end,point){
    var line = end.between(start);
    var s_p = point.between(start);
    var coll =  steerjs.Vector.multipleVector(s_p,line) == 0;
    return coll && ( ((start.x < point.x) && (point.x < end.x) || ((end.x < point.x) && (point.x < start.x) )));
};

/***
 * Returns new <0,0> vector
 * @returns {steerjs.Vector}
 */
steerjs.Vector.zero = function(){
    return new steerjs.Vector();
};

/***
 * Return new random vector
 * @param x
 * @param y
 * @returns {steerjs.Vector}
 */
steerjs.Vector.random = function(x,y){
    var newX = steerjs.Random(0,x);
    var newY = steerjs.Random(0,y);

    return new steerjs.Vector(newX,newY);
};

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
/***
 * @class EventHandler
 * It's used to handle game events, which was configured in config
 * @constructor
 */
steerjs.EventHandler = function(){
    this.event = null;
    this.algoRunner = null;
    this.handler = {};
    this.$injector = new steerjs.Injector();
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
    this.$injector.registerConstant(name, value);
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

steerjs.$globalInjector = new steerjs.Injector();


steerjs.module = function(name, dependencies){
    if(!steerjs.$globalInjector.canResolve(name) && dependencies != undefined && steerjs.isArray(dependencies)){
        var injector = new steerjs.Injector();
        for(var i = 0; i < dependencies.length; i++){
            if(!steerjs.$globalInjector.canResolve(dependencies[i])){
                throw new Error("Cant resolve " + dependencies[i] + " dependency");
            }else{
                var depModule = steerjs.$globalInjector.get(dependencies[i]);
                var key;
                for(key in depModule.$injector.dependencies){
                    injector.register(key,depModule.$injector.dependencies[key]);
                }
                for(key in depModule.$injector.services){
                    injector.registerService(key,depModule.$injector.services[key]);
                }
            }
        }
        var module = new steerjs.Module(name, injector);
        for(var i = 0; i < dependencies.length; i++){
            if(!steerjs.$globalInjector.canResolve(dependencies[i])){
                throw new Error("Cant resolve " + dependencies[i] + " dependency");
            }else{
                var depModule = steerjs.$globalInjector.get(dependencies[i]);
                module.$handler.handler = steerjs.extend(depModule.$handler.handler)
            }
        }
        steerjs.$globalInjector.register(name, module);
        return module;
    } else if(steerjs.$globalInjector.canResolve(name) && dependencies == undefined){
        return steerjs.$globalInjector.get(name);
    }else{
        throw new Error("Can't create module" + name + " cause dependency array is empty");
    }
};

steerjs.register = function(name, value){
  steerjs.$globalInjector.register(name,value);
};



    root.steerjs = steerjs;
}).call(this);
