import { Vector3 } from "three";

export default class Axis {
    public name: string;
    public color: string;
    public endPoint: Vector3;

    constructor(name: string, color: string, endpoint: Vector3) {
        this.name = name;
        this.color = color;
        this.endPoint = endpoint;
    }
}