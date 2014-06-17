function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function game(){

    //создание модуля библиотеки с пустым списком зависмостей
    var gameApp = steerjs.module("gameApp",[]);
    gameApp.
        constant("WIDTH", 800) /* установка константы */
        .constant("HEIGHT", 600)
        .constant("MAX_DIST", 20)
        .constant("MAX_DIST_GOAL", 7)
        .constant("ANGLE",25)
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
        .service("AngleConverter", function(){
            return{
                toDegree: function(radian){
                    return radian * 180 / Math.PI;
                },
                toRadian: function(degree){
                    return degree * Math.PI / 180;
                }
            }
        })
        .service("UnitGenerator", function(ANGLE, AngleConverter, SpriteFactory){
            var current = 1;
            var center = new steerjs.Vector(400,300);
            var r = 100;
            function coordinate(angle){
                return new steerjs.Vector(Math.floor(center.x +r * Math.sin(angle)), Math.floor(center.y + r*Math.cos(angle)) );
            }
            return{
                generateNewUnit: function(){
                    var angle = AngleConverter.toRadian(current * ANGLE);
                    var goalAngle = AngleConverter.toRadian(current * ANGLE + 180);
                    current++;
                    return{
                        acceleration: steerjs.Vector.zero(),
                        velocity: steerjs.Vector.zero(),
                        maxSpeed: getRandomInt(1,5),
                        location: coordinate(angle),
                        sprite: SpriteFactory.getSprite("monster", "images/dorver-idle0.png"),
                        isReachGoal: false,
                        goal: coordinate(goalAngle),

                        update: function(force){
                            if(force != null){
                                this.acceleration.add(force);
                                this.velocity.add(this.acceleration);
                                this.velocity.limit(this.maxSpeed);
                                this.location.add(this.velocity);
                                this.acceleration = steerjs.Vector.zero();
                            }
                            this.sprite.position.x = this.location.x;
                            this.sprite.position.y = this.location.y;
                        }
                    }
                }
            }

        })
        .algorithm("arrival", steerjs.arrival).algorithm("separate",steerjs.separate) /* регистрация алгоритмов*/
        .handlerConfig(function($handler){  /*  конфигурация обработчика событий */
            $handler.on("hasGoal.simple",{
                "algo":[
                    {"name": "arrival", "params":{alfa: 1, closestsRadius: 50} }
                ]
            });

            $handler.on("hasGoal.hard",{
                "algo":[
                    {"name": "arrival", "params":{alfa: 0.4, closestsRadius: 50} },
                    {name: "separate", "params": {alfa: 15, separateRadius: 45}}
                ]
            });

            $handler.on("reachGoal",{
                "algo":[
                    {name: "separate", "params": {alfa: 10, separateRadius: 45}}
                ]
            });
        })
        .boot();

    gameApp.run(function(Stage, Renderer, UnitGenerator, MAX_DIST, MAX_DIST_GOAL){
       // document.body.appendChild(Renderer.getRender().view);
        $("#testGame").append(Renderer.getRender().view);
        var units = [];


        var count  = Math.floor(360 / 25);
        for(var i = 0; i < count; i++){
            units.push(UnitGenerator.generateNewUnit());
            Stage.getStage().addChild(units[i].sprite);
        }

        var go = false;
        Stage.getStage().click  = function(mouseData){
            go = true;
        };

        requestAnimFrame(animate);


        function animate(){

            for(var i = 0; i < units.length; i++){
                if(go){
                    var force = null;
                    units[i].isReachGoal = steerjs.Vector.distance(units[i].goal,units[i].location) < MAX_DIST_GOAL;
                    if(units[i].goal != null && !units[i].isReachGoal){
                        force = gameApp.handler().fire("hasGoal.hard", {unit: units[i], goal: units[i].goal, units: units });
                    }
                    if(units[i].isReachGoal){
                        force = gameApp.handler().fire("reachGoal", {unit: units[i], units: units });
                    }

                    units[i].update(force);
                    units[i].isReachGoal = steerjs.Vector.distance(units[i].goal,units[i].location) < MAX_DIST_GOAL;
                    if( units[i].isReachGoal){
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
                }else{
                    units[i].update(null);
                }

            }
            Renderer.getRender().render(Stage.getStage());
            requestAnimFrame(animate);
        }

    });


}


$(document).ready(game);