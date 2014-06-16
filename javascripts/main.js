
function game(){

    //создание модуля библиотеки с пустым списком зависмостей
    var gameApp = steerjs.module("gameApp",[]);
    gameApp.
        constant("WIDTH", 800) /* установка константы */
        .constant("HEIGHT", 600)
        .constant("MAX_DIST", 100)
        .constant("MAX_DIST_GOAL", 100)
        .service("Stage", function(){ /* создание сервиса*/
            var stage = new PIXI.Stage(0x888888, true);
            return{
                getStage: function(){
                    return stage;
                }
            }
        })
        .service("Renderer", function(WIDTH,HEIGHT){
            var renderer = PIXI.autoDetectRenderer(WIDTH,HEIGHT,null,false);
            return{
                getRender: function(){
                    return renderer;
                }
            }
        })
        .service("SpriteFactory", function(){ /* более серьёзный сервис*/
            var textureHash  = {};
            return{
                getSprite: function(name, path){
                    var texture = null;
                    if(textureHash.hasOwnProperty(name)){
                        texture = textureHash[name];
                    }else{
                        texture = PIXI.Texture.fromImage(path);
                        textureHash[name] = texture;
                    }if(texture == null){
                        throw  new Error("Can't find or load texture " + name + " by path " + path);
                    }
                    var sprite =  new PIXI.Sprite(texture);
                    sprite.anchor.x = 0.5;
                    sprite.anchor.y = 0.5;
                    return sprite;
                }
            }
        })
        .algorithm("arrival", steerjs.arrival).algorithm("separate",steerjs.separate) /* регистрация алгоритмов*/
        .handlerConfig(function($handler){  /*  конфигурация обработчика событий */
            $handler.on("hasGoal.simple",{
                "algo":[
                    {"name": "arrival", "params":{alfa: 1, closestsRadius: 100} }
                ]
            });

            $handler.on("hasGoal.hard",{
                "algo":[
                    {"name": "arrival", "params":{alfa: 1, closestsRadius: 200} },
                    {name: "separate", "params": {alfa: 15, separateRadius: 170}}
                ]
            });

            $handler.on("reachGoal",{
                "algo":[
                    {name: "separate", "params": {alfa: 2, separateRadius: 170}}
                ]
            });
        })
        .boot();

    gameApp.run(function(Stage, Renderer, SpriteFactory, MAX_DIST, MAX_DIST_GOAL){
       // document.body.appendChild(Renderer.getRender().view);
        $("#testGame").append(Renderer.getRender().view);
        var monsters = [];
        var units = [
            {
                velocity: steerjs.Vector.zero(),
                acceleration: steerjs.Vector.zero(),
                location: new steerjs.Vector(100,100),
                maxSpeed: 3,
                reach: false
            } ,
            {
                velocity: steerjs.Vector.zero(),
                acceleration: steerjs.Vector.zero(),
                location: new steerjs.Vector(200,200),
                maxSpeed: 4,
                reach: false
            } ,
            {
                velocity: steerjs.Vector.zero(),
                acceleration: steerjs.Vector.zero(),
                location: new steerjs.Vector(300,100),
                maxSpeed: 3,
                reach: false
            },

            {
                velocity: steerjs.Vector.zero(),
                acceleration: steerjs.Vector.zero(),
                location: new steerjs.Vector(800,600),
                maxSpeed: 3,
                reach: false
            }
        ];
        monsters[0] = SpriteFactory.getSprite("monster", "images/dorver-idle0.png");
        monsters[1] = SpriteFactory.getSprite("monster", "images/dorver-idle0.png");
        monsters[2] = SpriteFactory.getSprite("monster", "images/dorver-idle0.png");
        monsters[3] = SpriteFactory.getSprite("monster", "images/dorver-idle0.png");


        monsters[0] .position.x = 100;
        monsters[0] .position.y = 100;
        monsters[1] .position.x = 200;
        monsters[1] .position.y = 200;
        monsters[2] .position.x = 300;
        monsters[2] .position.y = 100;
        monsters[3] .position.x = 800;
        monsters[3] .position.y = 600;

        Stage.getStage().addChild(monsters[0]);
        Stage.getStage().addChild(monsters[1]);
        Stage.getStage().addChild(monsters[2]);
        Stage.getStage().addChild(monsters[3]);

        var goal = null;
        Stage.getStage().click  = function(mouseData){
            var coord = mouseData.getLocalPosition(Stage.getStage());
            goal = new steerjs.Vector(coord.x, coord.y);
            for(var i = 0; i < units.length; i++) {
                units[i].reach = false;
            }
        };

        requestAnimFrame(animate);


        function animate(){
            var goalReached = false;
            for(var i = 0; i < units.length; i++){
                var force = null;
                if(goal != null && !units[i].reach){
                    force = gameApp.handler().fire("hasGoal.hard", {unit: units[i], goal: goal, units: units });
                }
                if(units[i].reach){
                    force = gameApp.handler().fire("reachGoal", {unit: units[i], units: units });
                }

                if(force != null){
                    units[i].acceleration.add(force);
                    units[i].velocity.add(units[i].acceleration);
                    units[i].velocity.limit(units[i].maxSpeed);
                    units[i].location.add(units[i].velocity);
                    units[i].acceleration = steerjs.Vector.zero();
                    monsters[i].position.x = units[i].location.x;
                    monsters[i].position.y = units[i].location.y;
                }


                if(goal != null && !units[i].reach){
                    units[i].reach = steerjs.Vector.distance(goal,units[i].location) < MAX_DIST_GOAL;
                    if(units[i].reach){
                        units[i].velocity = steerjs.Vector.zero();
                    }
                    goalReached &= units[i].reach;
                    if(goalReached){
                        goal = null;
                        goalReached = false;
                    }
                }

                if( units[i].reach){
                    var d = false;
                    for(var j = 0; j < units.length;j++){
                        if(units[i] == units[j]) continue;
                        var dist = steerjs.Vector.distance(units[i].location, units[j].location);
                        if(dist < MAX_DIST){
                            d = true;
                            break;
                        }
                    }
                    if(!d){
                        units[i].velocity = steerjs.Vector.zero();
                    }
                }
            }
            Renderer.getRender().render(Stage.getStage());
            requestAnimFrame(animate);
        }

    });


}


$(document).ready(game);