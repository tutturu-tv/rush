import logger from "../../utils/logger";
import GameField from "../GameField";

declare interface Entity {
  x: number;
  y: number;
  solid: boolean;
  spawn(gameField: GameField, x: number, y: number): void;
  despawn(): void;
  collide(entity: Entity): void;
}

abstract class Entity {
  protected gameField: GameField | null = null;
  public x = 0;
  public y = 0;
  public solid = true;

  public spawn(gameField: GameField, x?: number, y?: number) {
    if (!x || !y || !gameField.canSpawnAt(x, y))
      [x, y] = gameField.findFreeCell();
    this.x = x;
    this.y = y;
    this.gameField = gameField;
    gameField.field[y][x] = this;
  }

  public despawn() {
    if (!this.gameField)
      return logger.error("Can not despawn entity until it spawned");
    this.gameField.field[this.y][this.x] = null;
    this.x = 0;
    this.y = 0;
    this.gameField = null;
  }

  public collide(entity: Entity) {
    void entity;
  }
}

export default Entity;