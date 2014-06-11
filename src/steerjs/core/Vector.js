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
    res.multipleScalar(scalar);
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
