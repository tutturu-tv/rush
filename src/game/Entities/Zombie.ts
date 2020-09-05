import Entity from './Entity';
import Player from './Player';

class Zombie extends Entity {
  public collide(entity: Entity) {
    if (!(entity instanceof Player)) return;
    entity.changeTeam('Green');
  }

  public toString() {
    const object = {
      x: this.x,
      y: this.y,
      _entityType: 'Zombie',
    };

    return JSON.stringify(object);
  }
}

export default Zombie;
