import { BaseShapeInterface } from "./BaseShapeInterface";
import { Point } from "./Point";

export interface LineInterface extends BaseShapeInterface {
    pointsList: Point[];
}
