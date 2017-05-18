/**
 * Created by cooperanderson on 12/11/16 AD.
 */

Math.rad2deg = 180 / Math.PI;
Math.deg2rad = Math.PI / 180;

/**
 * The Vector2 class
 */
class Vector2 {
	/**
	 * Instantiate a new Vector2 instance
	 * @param x - The x component of the vector
	 * @param y - The y component of the vector
	 */
	constructor(x=0, y=0) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Get the magnitude of the vector
	 * @returns {number} The magnitude of the vector
	 */
	get magnitude() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	/**
	 * Set the magnitude of the vector
	 * @param {number} value - The new magnitude of the vector
	 */
	set magnitude(value) {
		this.x = Vector2.Mult(this.normalized, value).x;
		this.y = Vector2.Mult(this.normalized, value).y;
		return this;
	}

	/**
	 * Get the normalized version of this vector
	 */
	get normalized() {
		return Vector2.Div(this, this.magnitude);
	}

	/**
	 * Set the normalized version of this vector
	 */
	set normalized(vector) {
		this.x = vector.normalized.x;
		this.y = vector.normalized.y;
		return this;
	}

	/**
	 * Set this vector to its normalized vector
	 */
	Normalize() {
		this.x = this.normalized.x;
		this.y = this.normalized.y;
		return this;
	}

	/**
	 * Get the distance from this vector to another vector
	 * @param {Vector2} other - The other vector
	 * @returns {number} The distance between this vector and the other vector
	 */
	Distance(other) {
		return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
	}

	/**
	 * Rotate this vector by angle theta
	 * @param {number} theta - Degrees to rotate by
	 * @returns {Vector2} The new rotated vector
	 */
	Rotate(theta=90) {
		let vector = Vector2.Rotate(this, theta);
		this.x = vector.x;
		this.y = vector.y;
		return this;
	}

	/**
	 * Get the angle of the vector
	 * @returns {number} The angle of the vector
	 */
	Angle(round=true) {
		round = (round) ? Math.round : function(value) {return value};
		return Math.atan2(this.x, this.y) * Math.rad2deg;
	}

	/**
	 * Add another vector to this vector
	 * @param {Vector2} other - the other vector
	 * @returns {Vector2} The new vector
	 */
	Add(other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	/**
	 * Subtract another vector from this vector
	 * @param {Vector2} other - the other vector
	 * @returns {Vector2} The new vector
	 */
	Sub(other) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}

	/**
	 * Multiply this vector by a value
	 * @param {number} value - The value to be scaled by
	 * @returns {Vector2} The new vector
	 */
	Mult(value) {
		this.x *= value;
		this.y *= value;
		return this;
	}

	/**
	 * Divide this vector by a value
	 * @param {number} value - The value to be scaled by
	 * @returns {Vector2} The new vector
	 */
	Div(value) {
		if (value == 0) {
			this.x = 0;
			this.y = 0;
			return this;
		}
		this.x /= value;
		this.y /= value;
		return this;
	}

	/**
	 * Add two vectors together
	 * @param {Vector2} vector - The first vector
	 * @param {Vector2} other - The second vector
	 * @returns {Vector2} The new vector
	 */
	static Add(vector, other) {
		return new Vector2(vector.x + other.x, vector.y + other.y);
	}

	/**
	 * Subtract two vectors
	 * @param {Vector2} vector - The first vector
	 * @param {Vector2} other - The second vector
	 * @returns {Vector2} The new vector
	 */
	static Sub(vector, other) {
		return new Vector2(vector.x - other.x, vector.y - other.y);
	}

	/**
	 * Multiply a vector and a number
	 * @param {Vector2} vector - The vector
	 * @param {number} value - The scalar value
	 * @returns {Vector2} The new vector
	 */
	static Mult(vector, value) {
		return new Vector2(vector.x * value, vector.y * value);
	}

	/**
	 * Divide a vector and a number
	 * @param {Vector2} vector - The vector
	 * @param {number} value - The scalar value
	 * @returns {Vector2} The new vector
	 */
	static Div(vector, value) {
		if (value == 0) {
			return new Vector2();
		}
		return new Vector2(vector.x / value, vector.y / value);
	}

	static Dot(vectorA, vectorB) {
		return (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y);
	}

	/**
	 * Get the distance between two vectors
	 * @param {Vector2} vector - The first vector
	 * @param {Vector2} other - The second vector
	 * @returns {number} The distance between the two vectors
	 * @constructor
	 */
	static Distance(vectorA, vectorB) {
		return Math.sqrt(Math.pow(vectorA.x - vectorB.x, 2) + Math.pow(vectorA.y - vectorB.y, 2));
	}

	static Angle(vectorA, vectorB) {
		return Math.acos(Vector2.Dot(vectorA.normalized, vectorB.normalized)) * Math.rad2deg;
	}

	static DistanceFromVectorToPoint(vector, point) {
		let hypotenuse = Vector2.Distance(new Vector2(), point);
		let angle = Vector2.Angle(vector, point);
		let opposite = hypotenuse * Math.sin(angle * Math.deg2rad);
		return opposite;
	}

	static GetIntersection(pointA, vectorA, pointB, vectorB) {
		let ao = pointA;
		let av = vectorA;
		let bo = pointB;
		let bv = vectorB;
		let d = Vector2.Sub(bo, ao);
		let det = bv.x * av.y - bv.y * av.x;
		let u = (d.y * bv.x - d.x * bv.y) / det
		let v = (d.y * av.x - d.x * av.y) / det
		return new Vector2(v, u);
	}

	static areClockwise(v1, v2) {
		return -v1.x*v2.y + v1.y*v2.x > 0;
	}

	/**
	 * Rotate a vector by the given amount of degrees
	 * @param {Vector2} vector - The vector
	 * @param {number} theta - The amount in degrees
	 * @returns {Vector2} - The new rotated vector
	 */
	static Rotate(vector, theta=90) {
		var rotated = new Vector2();
		rotated.x = /*Math.round*/(vector.x * Math.cos(-theta * Math.deg2rad) - vector.y * Math.sin(-theta * Math.deg2rad));
		rotated.y = /*Math.round*/(vector.x * Math.sin(-theta * Math.deg2rad) + vector.y * Math.cos(-theta * Math.deg2rad));
		return rotated.normalized.Mult(vector.magnitude);
	}

	/**
	 * The global up vector
	 * @returns {Vector2}
	 */
	static get up() {
		return new Vector2(0, 1);
	}

	/**
	 * The global down vector
	 * @returns {Vector2}
	 */
	static get down() {
		return new Vector2(0, -1);
	}

	/**
	 * The global left vector
	 * @returns {Vector2}
	 */
	static get left() {
		return new Vector2(-1, 0);
	}

	/**
	 * The global right vector
	 * @returns {Vector2}
	 */
	static get right() {
		return new Vector2(1, 0);
	}
}

module.exports = {Vector2};
