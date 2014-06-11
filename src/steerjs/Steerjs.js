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
