export class Vector2 {
    static get zero() {
        return new Vector2(0, 0);
    }

    static get one() {
        return new Vector2(1, 1);
    }

    static get up() {
        return new Vector2(0, 1);
    }

    static get down() {
        return new Vector2(0, -1);
    }

    static get left() {
        return new Vector2(-1, 0);
    }

    static get right() {
        return new Vector2(1, 0);
    }

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    distance(other) {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }

    normalize() {
        const magnitude = this.magnitude;
        return new Vector2(this.x / magnitude, this.y / magnitude);
    }

    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    up() {
        this.y++;
    }

    down() {
        this.y--;
    }

    left() {
        this.x--;
    }

    right() {
        this.x++;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    hashCode() {
        let hash = 17;
        hash = hash * 31 + this.x;
        hash = hash * 31 + this.y;
        return hash;
    }
}

export class CellPos extends Vector2 {
    constructor(x, y) {
        super(x >> 5, y >> 5);
    }

    toPixel() {
        return new Vector2(this.x * 32, this.y * 32);
    }

    toPixelCenter() {
        return new Vector2(this.x * 32 + 16, this.y * 32 + 16);
    }

    clone() {
        return new CellPos(this.x, this.y);
    }
}