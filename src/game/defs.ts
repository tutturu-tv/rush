import Player from "./Entities/Player";

export const moveMap = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export type MoveDirection = keyof typeof moveMap;

export interface Data {
  [x: string]: any
}

export interface GameEvent {
  type: string;
  data: Data;
}

export class JoinEvent implements GameEvent {
  public type = "PLAYER_JOINED";
  public data: JoinEventData;

  public constructor(player: Player | string) {
    this.data = { player: player.toString() };
  }
}

interface JoinEventData {
  player: string
}

export class LeaveEvent implements GameEvent {
  public type = "PLAYER_LEAVES";
  public data: LeaveEventData;

  public constructor(playerId: string) {
    this.data = { playerId };
  }
}

interface LeaveEventData {
  playerId: string
}

export class TeamChangeEvent implements GameEvent {
  public type = "PLAYER_TEAM_CHANGE";
  public data: TeamChangeEventData;

  public constructor(player: Player | string) {
    this.data = { player: player.toString() };
  }
}

interface TeamChangeEventData {
  player: string
}

export class MoveEvent implements GameEvent {
  public type = "PLAYER_MOVED";
  public data: MoveEventData;

  public constructor(player: Player | string) {
    this.data = { player: player.toString() };
  }
}

interface MoveEventData {
  player: string
}
