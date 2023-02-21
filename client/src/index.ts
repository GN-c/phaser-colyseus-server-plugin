import Phaser from "phaser";

import { Part4Scene } from "./scenes/Part4Scene";

import { BACKEND_HTTP_URL } from "./backend";
import ColyseusServerPlugin from "./ColyseusServerPlugin";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  // height: 200,
  backgroundColor: "#b6d53c",
  parent: "phaser-example",
  physics: {
    default: "arcade",
    arcade: {
      fixedStep: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  pixelArt: true,
  scene: [Part4Scene],
  plugins: {
    scene: [ColyseusServerPlugin],
  },
});

// fpsInput.oninput = function (event: InputEvent) {
//   const value = (event.target as HTMLInputElement).value;
//   fpsValueLabel.innerText = value;

//   // destroy previous loop
//   game.loop.destroy();

//   // create new loop
//   game.loop = new Phaser.Core.TimeStep(game, {
//     target: parseInt(value),
//     forceSetTimeOut: true,
//     smoothStep: false,
//   });

//   // start new loop
//   game.loop.start(game.step.bind(game));
// };
