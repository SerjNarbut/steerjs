'use strict';

describe("Algorithm tests", function(){

    it("Seek test - reach goal", function(){
        var goal = new steerjs.Vector(20,50);

        var unit = {
            maxSpeed: 2,
            location: new steerjs.Vector(100,70),
            velocity: new steerjs.Vector(1,2),
            accelaration: steerjs.Vector.zero()
        };

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

        var unit = {
            maxSpeed: 2,
            location: new steerjs.Vector(100,70),
            velocity: new steerjs.Vector(1,2),
            accelaration: steerjs.Vector.zero()
        };
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

    });

    it("Pursuit test - reach leader", function(){

    });
});
