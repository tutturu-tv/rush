import Client from '@cryb/mesa/server/client';
import { randomNumber, inRange } from '../utils/util';
import Entity from './Entities/Entity';
import { EventEmitter } from 'events';
import { GameEvent } from './defs';

declare interface GameField {
  field: (Entity | null)[][];
  width: number;
  height: number;
  despawn(x: number, y: number): void;
  move(entity: Entity, offset: number[]): boolean;
  findFreeCell(): [number, number];
  canSpawnAt(x: number, y: number): boolean;
  on(event: 'event', listener: (event: GameEvent, author?: Client) => void): this;
  safeExport(): string[][];
}

class GameField extends EventEmitter {
  public field: (Entity | null)[][];
  public width: number;
  public height: number;

  public constructor(width: number, height: number) {
    super();

    this.width = width;
    this.height = height;

    this.field = [];
    for (let y = 0; y < height; y++) {
      this.field[y] = [];
      for (let x = 0; x < width; x++)
        this.field[y][x] = null;
    }
  }

  public despawn(x: number, y: number) {
    this.field[y][x]?.despawn();
  }

  public move(entity: Entity, offset: number[]): boolean {
    const newX = entity.x + offset[0];
    const newY = entity.y + offset[1];
    if (!inRange(newX, 0, this.width - 1) || !inRange(newY, 0, this.height - 1))
      return false;

    const collidedEntity = this.field[newY][newX];
    if (collidedEntity) {
      collidedEntity.collide(entity);
      if (collidedEntity.solid) return false;
    }

    this.field[entity.y][entity.x] = null;
    entity.x = newX;
    entity.y = newY;
    this.field[newY][newX] = entity;

    return true;
  }

  public findFreeCell(): [number, number] {
    let cellX, cellY;
    do {
      cellX = randomNumber(this.width);
      cellY = randomNumber(this.height);
    } while (this.field[cellY][cellX] != null);
    return [cellX, cellY];
  }

  public canSpawnAt(x: number, y: number) {
    return this.field[y][x] === null && inRange(x, 0, this.width - 1) && inRange(y, 0, this.height - 1);
  }

  public safeExport() {
    return this.field.map(row => row.map(entity => entity?.toString()));
  }
}

export default GameField;
