import Model from "./Model";

import Client from "mesa-js-client";
import { MoveDirection, InitMessage } from "./defs";
import { Message } from "mesa-js-client/dist/module/defs";

const keyMap: [MoveDirection, string[]][] = [
  ["up", ["ArrowUp", "w"]],
  ["down", ["ArrowDown", "s"]],
  ["left", ["ArrowLeft", "a"]],
  ["right", ["ArrowRight", "d"]]
];

interface IController {
  setup(data: InitMessage): void;
  move(directionKey: string): void;
}

class Controller implements IController {
  private model: Model;
  private client: Client;

  public constructor(client: Client) {
    this.model = new Model();
    this.client = client;
  }

  public setup(data: InitMessage) {
    this.model.setup(data);

    this.client.onDisconnected = (code, reason) => this.registerDisconnection(code, reason);
    this.client.onError = error => this.registerError(error);
    this.client.onMessage = message => this.registerMessage(message);
  }

  public move(directionKey: string) {
    const directionEntry = keyMap.find(dir => dir[1].includes(directionKey));
    if (!directionEntry) return;

    const direction = directionEntry[0];
    if (!this.model.isMoveValid(direction))
      return console.log("[MOVE] Can't move in this direction", direction);

    this.client.send(0, { direction }, "MOVE");
  }

  private registerDisconnection(code: number, reason: string) {
    console.log("Disconnected", code, reason);
  }

  private registerError(error: Error) {
    console.log("Error", error);
  }

  private registerMessage(message: Message) {
    if (message.type != "GAME_EVENT")
      return console.error("Unexpected message from server", message);
    const { data, type } = message.data;

    switch (type) {
      case "PLAYER_JOINED":
        this.model.registerJoin(JSON.parse(data.player));
        break;
      case "PLAYER_LEAVES":
        this.model.registerLeave(data.playerId);
        break;
      case "PLAYER_TEAM_CHANGE":
        this.model.updateTeam(JSON.parse(data.player));
        break;
      case "PLAYER_MOVED":
        this.model.updatePlayerPosition(JSON.parse(data.player));
        break;
      default:
        console.error("Invalid game event", data);
        break;
    }
  }
}

export default Controller;
