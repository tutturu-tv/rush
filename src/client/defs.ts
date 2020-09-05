import { Team } from '../game/Entities/Player';

export { moveMap, MoveDirection } from '../game/defs';

export const colorMap = {
  Player: '#F00',
  Zombie: '#0F0',
  Unknown: '#000',
};

export type EntityType = keyof typeof colorMap;

export interface Entity {
  x: number;
  y: number;
  solid: boolean;
  _entityType: EntityType;
}

export interface Player extends Entity {
  playerId: string;
  name: string;
  team: Team;
}

export interface InitMessage {
  gameField: string[][];
  self: string;
}
