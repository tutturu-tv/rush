import Entity from "./Entity";
import Zombie from "./Zombie";
import { TeamChangeEvent } from "../defs";

const nameRegExp = /^[0-9A-Za-z ]{1,15}$/;

export type Team = "Red" | "Green";

declare interface Player extends Entity {
  playerId: string;
  name: string;
  team: Team;
}

class Player extends Entity {
  public playerId: string;
  public name: string;
  public team: Team;

  public constructor(playerId: string, name: string, team: Team = "Red") {
    super();

    this.playerId = playerId;
    this.name = name;
    this.team = team;
  }

  public collide(entity: Entity) {
    if (entity instanceof Zombie) return this.changeTeam("Green");
    if (entity instanceof Player) {
      if (entity.team === "Green") return this.changeTeam("Green");
      if (this.team === "Green") return entity.changeTeam("Green");
    }
  }

  public toString() {
    const object = {
      x: this.x,
      y: this.y,
      playerId: this.playerId,
      name: this.name,
      team: this.team,
      _entityType: "Player",
    };

    return JSON.stringify(object);
  }

  public changeTeam(newTeam: Team) {
    if (this.team === newTeam) return;
    this.team = newTeam;
    this.gameField?.emit("event", new TeamChangeEvent(this));
  }

  public static validateName(name: string) {
    return nameRegExp.test(name) && name.replace(/\s/g, "") !== "";
  }
}

export default Player;
