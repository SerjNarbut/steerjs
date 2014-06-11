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
