describe("Module tests", function(){

    beforeEach(function(){
        steerjs.$globalInjector.unregister("testModule");
    });

    it("Can define module", function(){
        var module = steerjs.module("testModule", []);
        expect(module).toBeDefined();
    });

    it("Can create define algorithms", function(){
        var module = steerjs.module("testModule",[]);
        module.algorithm("seek", steerjs.seek);

        var expectFnct = steerjs.seek.toString();
        var actual = module.$injector.get("seek").toString();

        expect(expectFnct).toEqual(actual);
    });
    it("Can create constant", function(){
        var module = steerjs.module("testModule",[]);
        module.constant("G", 9.8);
        var expectConst = module.$injector.get("G");
        expect(expectConst).toEqual(9.8);
    });
    it("Can't define constant twice", function(){
        var module = steerjs.module("testModule",[]);
        module.constant("G", 9.8);

        expect(function(){
            module.constant("G",4);
        }).toThrow();
    });
    it("Can create service", function(){
        var module = steerjs.module("testModule",[]);
        module.service("TestLogger", function(){
            return{
                log:  function(){
                    console.log("test");
                }
            }
        });

        expect(module.$injector.canResolve("TestLogger")).toEqual(true);
    });
    it("Can run custom function", function(){
        var module = steerjs.module("testModule",[]);
        module.service("TestLogger", function(){
            return{
                log:  function(){
                    console.log("test");
                }
            }
        });

        module.run(function(TestLogger){
            expect(TestLogger).toBeDefined();
        });
    });
    it("Can config event handler", function(){
        var module = steerjs.module("testModule",[]);

        module.handlerConfig(function($handler){
            $handler.on("testEvent",{
                "algo":[
                    {"name": "seek", params: {alfa: 2}}
                ]
            })
        });

        expect(module.$handler.handler.hasOwnProperty("testEvent")).toEqual(true);
    });
});