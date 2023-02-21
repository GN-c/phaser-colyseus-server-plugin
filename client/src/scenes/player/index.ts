import { listen } from "../../ColyseusServerPlugin/decorators/listen";
import {
  sync,
  syncNumber,
  syncRotation,
} from "../../ColyseusServerPlugin/decorators/sync";

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "ship_0001");

    this.addToScene();
  }

  @sync("x", Phaser.Math.Linear)
  x: number;
  @syncNumber("y")
  y: number;

  @syncRotation("rotation") rotation: number;

  @listen("x")
  private test(previousValue, currentValue) {
    // console.log({ previousValue, currentValue });
  }

  private addToScene() {
    return this.scene.add.existing(this);
  }
}
