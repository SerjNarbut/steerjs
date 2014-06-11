'use strict';

describe("Algorithm tests", function(){

    var unit;
    beforeEach(function(){
        unit = {
            maxSpeed: 2,
            location: new steerjs.Vector(100,70),
            velocity: new steerjs.Vector(1,2),
            accelaration: steerjs.Vector.zero()
        };
    });

    it("Seek test - reach goal", function(){
        var goal = new steerjs.Vector(20,50);

        var reach = false;
        var count = 0;
        while(!reach){
            count++;

            var force = steerjs.seek(unit,goal,2);

            unit.accelaration.add(force);
            unit.velocity.add(unit.accelaration);
            unit.velocity.limit(unit.maxSpeed);
            unit.location.add(unit.velocity);
            unit.accelaration  = steerjs.Vector.zero();

           reach = steerjs.Vector.distance(unit.location, goal) <= 10;
        }
        console.log("seek test -> number of iteration to reach the goal " + count);
        expect(reach).toEqual(true);

    });

    it("Flee test - distance", function(){
        var goal = new steerjs.Vector(20,50);

        var distOne = steerjs.Vector.distance(goal,unit.location);
        var force = steerjs.flee(unit,goal,2);
        unit.accelaration.add(force);
        unit.velocity.add(unit.accelaration);
        unit.velocity.limit(unit.maxSpeed);
        unit.location.add(unit.velocity);
        unit.accelaration = steerjs.Vector.zero();

        var distTwo = steerjs.Vector.distance(unit.location, goal);

        expect(distTwo > distOne).toEqual(true);
    });

    //TODO coding test
    it("Pursuit test - distance", function(){

        var leader = {
            maxSpeed: 2,
            location: new steerjs.Vector(200,200),
            velocity: new steerjs.Vector(1,2),
            accelaration: steerjs.Vector.zero()
        };

        var distOne = steerjs.Vector.distance(unit.location, leader.location);

        for(var i = 0; i < 5;i++){
            var force = steerjs.pursuit(unit,leader,2);
            unit.accelaration.add(force);
            unit.velocity.add(unit.accelaration);
            unit.velocity.limit(unit.maxSpeed);
            unit.location.add(unit.velocity);
            unit.accelaration = steerjs.Vector.zero();
        }


        var distTwo = steerjs.Vector.distance(unit.location, leader.location);
        expect(distTwo < distOne).toEqual(true);

    });

    it("Pursuit test - reach leader", function(){

    });
});
