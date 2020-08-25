import Client from "@cryb/mesa/server/client";
import { Message } from "@cryb/mesa";
import { EventEmitter } from "events";
import GameField from "./GameField";
import Player from "./Entities/Player";
import Zombie from "./Entities/Zombie";
import { moveMap, MoveDirection, Data, GameEvent, MoveEvent, JoinEvent, LeaveEvent } from "./defs";
import { playersPerRoom } from "../../config.json";
import logger from "../utils/logger";

declare interface GameRoom extends EventEmitter {
  broadcast(message: Data, author?: Client): void;
  isNameAvailable(name: string): boolean;
  on(event: "connection", listener: (client: Client) => void): this
  on(event: "join", listener: (client: Client, name: string) => void): this
  on(event: "disconnection", listener: (client: Client, code: number, reason: string) => void): this
}

class GameRoom extends EventEmitter {
  private clients: Map<string, Client> = new Map();
  private players: Map<string, Player> = new Map();
  private gameField: GameField;

  public constructor(width: number, height: number) {
    super();

    this.gameField = new GameField(width, height);

    this.setup();
  }

  private setup() {
    const zombie = new Zombie();
    zombie.spawn(this.gameField, 1, this.gameField.height - 1);

    this.on("connection", this.registerConnection);
    this.on("join", this.registerJoin);
    this.on("disconnection", this.registerDisconnection);
    this.gameField.on("event", (event, author) => this.broadcast(event, author));
  }

  private registerConnection(client: Client) {
    logger.info(`Client ${client.serverId} connected`);

    this.clients.set(client.serverId, client);
    client.on("disconnect", (code, reason) => this.emit("disconnection", client, code, reason));

    this.requestName(client);
  }

  private registerDisconnection(client: Client, code: number, reason: string) {
    this.clients.delete(client.serverId);
    const player = this.players.get(client.serverId);
    if (!player)
      return logger.info(`Client ${client.serverId} disconnected`, code, reason);
    this.gameField.despawn(player.x, player.y);
    this.players.delete(client.serverId);
    logger.info(`Player ${client.serverId} disconnected`, code, reason);

    this.broadcast(new LeaveEvent(client.serverId));
  }

  private registerJoin(client: Client, name: string) {
    const player = new Player(client.serverId, name);
    this.players.set(client.serverId, player);
    player.spawn(this.gameField);

    client.send(new Message(0, { gameField: this.gameField.safeExport(), self: client.serverId }, "JOIN"), true);
    this.broadcast(new JoinEvent(player), client);
    client.on("message", message => this.registerMessage(client, message));
  }

  private registerMessage(client: Client, message: Message) {
    const { data, type } = message;
    logger.debug(`New message from ${client.serverId}`, data, type);

    switch(type) {
      case "MOVE":
        this.moveMessage(client, data);
        break;
      default:
        client.send(new Message(0, {}, "INVALID_MESSAGE_TYPE"), true);
        break;
    }
  }

  private moveMessage(client: Client, data: Data) {
    const player = this.players.get(client.serverId);
    const direction: MoveDirection = data?.direction;
    const moveOffset = moveMap[direction];
    if (!direction || !moveOffset)
      return client.send(new Message(0, { reason: "Invalid or missing direction" }, "INVALID_DATA"), true);

    if (!player) {
      logger.error(`Client ${client.serverId} has no player object`);
      return client.disconnect(1011);
    }

    const isMoved = this.gameField.move(player, moveOffset);
    if (isMoved)
      this.broadcast(new MoveEvent(player));
  }

  private requestName(client: Client) {
    const room = this;

    client.send(new Message(0, {}, "NAME_REQUEST"), true);
    client.on("message", function nameRequestHandler({ data, type }) {
      if (type != "NAME_REQUEST")
        return client.send(new Message(0, { reason: "Incorrect message type" }, "INVALID_NAME"), true);

      const name: string = data?.name;
      if (!name || !Player.validateName(name))
        return client.send(new Message(0, { reason: "Invalid or missing name" }, "INVALID_NAME"), true);

      if (!room.isNameAvailable(name))
        return client.send(new Message(0, { reason: "Name already taken" }, "INVALID_NAME")), true;

      if(room.players.size == playersPerRoom)
        return client.send(new Message(0, {}, "GAME_ROOM_IS_FULL"), true);

      client.removeListener("message", nameRequestHandler);
      room.emit("join", client, name);
    });
  }

  public broadcast(event: GameEvent, author?: Client) {
    for (const [ playerId ] of this.players) {
      if (author && author.serverId == playerId) continue;
      this.clients.get(playerId)?.send(new Message(0, event, "GAME_EVENT"), true);
    }
  }

  public isNameAvailable(name: string) {
    let available = true;
    this.players.forEach(player => {
      if (player.name == name)
        available = false;
    });
    return available;
  }
}

export default GameRoom;
