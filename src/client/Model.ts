import View from "./View";

import { moveMap, MoveDirection, Player, Entity, InitMessage } from "./defs";
import { inRange } from "../utils/util";

interface IModel {
  mapWidth: number;
  mapHeight: number;
  setup(data: InitMessage): void;
  isMoveValid(direction: MoveDirection): boolean;
  registerJoin(player: Player): void;
  registerLeave(playerId: string): void;
  updateTeam(updatedPlayer: Player): void;
  updatePlayerPosition(updatedPlayer: Player): void;
}

class Model implements IModel {
  private view: View;

  private gameField: (Entity | null)[][] = [];
  private players: Map<string, Player> = new Map();
  private player: Player;

  public mapWidth = 0;
  public mapHeight = 0;

  public constructor() {
    this.view = new View();
  }

  public setup(data: InitMessage) {
    this.gameField = data.gameField.map(row =>
      row.map(rawEntity => {
        const entity = JSON.parse(rawEntity);
        if (entity?._entityType === "Player")
          this.players.set(entity.playerId, entity);
        return entity;
      })
    );

    this.player = this.players.get(data.self) as Player;

    this.mapWidth = this.gameField[0].length;
    this.mapHeight = this.gameField.length;

    this.view.mouseLeaveHandler = () => this.view.hideTooltip();
    this.view.mouseMoveHandler = konvaEvent => {
      const e = konvaEvent.evt;
      const [x, y] = this.view.coordsToIndexes(e.offsetX, e.offsetY);
      const player = this.gameField[y][x] as Player;

      if (!player)
        return this.view.hideTooltip();
      if (player._entityType === "Player")
        return this.view.showTooltip(player.name, e.y, e.x);
      if (player._entityType === "Zombie")
        return this.view.showTooltip("Zombie", e.y, e.x);
    };

    this.view.setup(this.mapWidth, this.mapHeight);
    this.view.initField(this.gameField);
  }

  public isMoveValid(direction: MoveDirection) {
    const newX = this.player.x + moveMap[direction][0];
    const newY = this.player.y + moveMap[direction][1];
    return inRange(newX, 0, this.mapWidth - 1) && inRange(newY, 0, this.mapHeight - 1);
  }

  public registerJoin(player: Player) {
    const { x, y } = player;

    this.gameField[y][x] = player;
    this.players.set(player.playerId, player);

    this.view.addEntity(player, x, y);
  }

  public registerLeave(playerId: string) {
    const { x, y } = this.players.get(playerId) as Player;

    this.gameField[y][x] = null;
    this.players.delete(playerId);

    this.view.removeEntity(x, y);
  }

  public updateTeam(updatedPlayer: Player) {
    const { playerId } = updatedPlayer;
    const player = this.players.get(playerId);
    console.log(updatedPlayer, player, player?.team);
    if (!player) return;

    player.team = updatedPlayer.team;

    this.view.updateEntityColor(player);
  }

  public updatePlayerPosition(updatedPlayer: Player) {
    const newX = updatedPlayer.x;
    const newY = updatedPlayer.y;
    const player = this.players.get(updatedPlayer.playerId) as Player;
    const oldX = player.x;
    const oldY = player.y;

    this.gameField[oldY][oldX] = null;
    player.x = newX;
    player.y = newY;
    this.gameField[newY][newX] = player;

    this.view.moveEntity(updatedPlayer, [oldX, oldY]);
  }
}

export default Model;
