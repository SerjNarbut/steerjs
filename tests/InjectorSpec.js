'use strict';

describe("Injector tests", function(){

    it("Can create injector", function(){
        var injector = new steerjs.Injector();

        expect(injector).toBeDefined();
    });

    it("Can register dependencies", function(){
        var injector = new steerjs.Injector();
        var fnct = function(){
            console.log("test");
        };
        injector.register("logger",fnct);

        var value = injector.get("logger");

        expect(value).toBeDefined();
        expect(steerjs.isFunction(value)).toBe(true);
        expect(value.toString()).toEqual(fnct.toString());
    });

    it("should annotate function", function(){
        var deps = ['$log', 'simpleService'];

        var depsOne = steerjs.getDependencies(function($log, simpleService){});
        var depsTwo = steerjs.getDependencies(["$log","simpleService", function(p,p1){}]);
        expect(depsOne).toEqual(deps);
        expect(depsTwo).toEqual(deps);
    });

    it("should resolve dependencies", function(){
        var injector = new steerjs.Injector();

        injector.registerConstant("G", 9.8);
        var ans = injector.resolve(function(G){
            return G *2;
        });
        expect(ans).toEqual(9.8 * 2);
    });

    it("Should't change constant", function(){
        var injector = new steerjs.Injector();

        injector.registerConstant("G", 9.8);
        expect(function() {injector.registerConstant("G", 9.8)}).toThrow();
    });
});
