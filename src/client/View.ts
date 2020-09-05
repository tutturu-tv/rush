// @ts-ignore
import { Stage } from 'konva/lib/Stage';
import { Stage as TStage } from 'konva/types/Stage';
// @ts-ignore
import { Layer } from 'konva/lib/Layer';
import { Layer as TLayer } from 'konva/types/Layer';
// @ts-ignore
import { Rect } from 'konva/lib/shapes/Rect';
import { Rect as TRect } from 'konva/types/shapes/Rect';

import { colorMap, Entity } from './defs';
import { KonvaEventListener } from 'konva/types/Node';

const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;

interface IView {
  mouseLeaveHandler: (KonvaEventListener<TRect, MouseEvent>) | undefined;
  mouseMoveHandler: (KonvaEventListener<TRect, MouseEvent>) | undefined;
  setup(mapWidth: number, mapHeight: number): void;
  initField(gameField: (Entity | null)[][]): void;
  addEntity(entity: Entity | null, x: number, y: number): void;
  moveEntity(entity: Entity, oldPosition: [number, number]): void;
  removeEntity(x: number, y: number): void;
  updateEntityColor(entity: Entity): void;
  coordsToIndexes(offsetX: number, offsetY: number): [number, number];
  showTooltip(text: string, top: number, left: number): void;
  hideTooltip(): void;
}

class View implements IView {
  private tooltip: HTMLDivElement;
  private stage: TStage;
  private layer: TLayer;
  private shapes: TRect[] = [];
  public mouseLeaveHandler: KonvaEventListener<TRect, MouseEvent> | undefined;
  public mouseMoveHandler: KonvaEventListener<TRect, MouseEvent> | undefined;

  private cellWidth = 0;
  private cellHeight = 0;

  public constructor() {
    this.tooltip = document.createElement('div');
  }

  public setup(mapWidth: number, mapHeight: number) {
    this.tooltip.id = 'tooltip';
    this.cellWidth = Math.floor(CANVAS_WIDTH / mapWidth);
    this.cellHeight = Math.floor(CANVAS_HEIGHT / mapHeight);

    const container = document.createElement('div');
    container.id = 'game-container';
    document.body.appendChild(container);
    this.stage = new Stage({
      width: this.cellWidth * mapWidth,
      height: this.cellHeight * mapHeight,
      container: `#${container.id}`,
    });
    this.layer = new Layer();
    this.stage.add(this.layer);

    document.body.appendChild(this.tooltip);
  }

  public initField(gameField: (Entity | null)[][]) {
    gameField.flat(2).filter(Boolean).forEach(entity => {
      entity = entity as Entity;
      this.addEntity(entity, entity.x, entity.y);
    });
  }

  public addEntity(entity: Entity, x: number, y: number) {
    const shape: TRect = new Rect({
      x: x*this.cellWidth,
      y: y*this.cellHeight,
      width: this.cellWidth,
      height: this.cellHeight,
      fill: this.getEntityColor(entity),
    });

    if (this.mouseLeaveHandler)
      shape.on('mouseleave', this.mouseLeaveHandler);
    if (this.mouseMoveHandler)
      shape.on('mousemove', this.mouseMoveHandler);

    this.shapes.push(shape);
    this.layer.add(shape);
    this.layer.draw();
  }

  public moveEntity(entity: Entity, [x, y]: [number, number]) {
    const shape = this.getShape(x, y);
    const offsetX = (entity.x - x)*this.cellWidth;
    const offsetY = (entity.y - y)*this.cellHeight;

    shape?.move({ x: offsetX, y: offsetY });
    this.layer.draw();
  }

  public removeEntity(x: number, y: number) {
    const shape = this.getShape(x, y);

    shape?.destroy();
    this.layer.draw();
  }

  public updateEntityColor(entity: Entity) {
    const shape = this.getShape(entity.x, entity.y);

    shape?.fill(this.getEntityColor(entity));
    this.layer.draw();
  }

  public coordsToIndexes(offsetX: number, offsetY: number): [number, number] {
    const x = Math.floor(offsetX / this.cellWidth);
    const y = Math.floor(offsetY / this.cellHeight);

    return [x, y];
  }

  public showTooltip(text: string, top: number, left: number) {
    this.tooltip.innerText = text;
    this.tooltip.style.setProperty('top', `${top}px`);
    this.tooltip.style.setProperty('left', `${left}px`);
  }

  public hideTooltip() {
    this.tooltip.style.removeProperty('top');
    this.tooltip.style.removeProperty('left');
  }

  private defineEntity(entity: any) {
    if (entity._entityType === 'Player' && entity.team === 'Red') return 'Player';
    if (entity._entityType === 'Zombie' || entity?.team === 'Green') return 'Zombie';
    return 'Unknown';
  }

  private getShape(x: number, y: number) {
    return this.shapes.find(e => e.x() === x*this.cellWidth && e.y() === y*this.cellHeight);
  }

  private getEntityColor(entity: Entity) {
    return colorMap[this.defineEntity(entity)];
  }
}

export default View;
