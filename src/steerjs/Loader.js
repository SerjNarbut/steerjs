
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

