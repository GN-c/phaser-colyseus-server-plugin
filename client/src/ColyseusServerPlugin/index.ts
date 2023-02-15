import { EndpointSettings } from "colyseus.js/lib/Client";
import Colyseus from "colyseus.js";
import TickLoop from "./TickLoop";

/**
 * Extend Global Phaser Namespace
 */
declare global {
  namespace Phaser {
    interface Scene {
      /**
       * Colyseus Server Manager Plugin
       */
      colyseusServer: ColyseusServerPlugin;
      /**
       * Automatically gets called by `ColyseusServerPlugin` at fixed intervals
       */
      fixedTick?(delta: number, tick: number): void;
    }
    namespace Scenes {
      interface Systems {
        /**
         * Colyseus Server Manager Plugin
         */
        colyseusServer: ColyseusServerPlugin;
      }
    }
    namespace Core {
      interface Config {
        /**
         * Colyseus server configuration
         */
        colyseusServer: ColyseusServerPluginConfig;
      }
    }
    interface Game {
      constructor(
        GameConfig?: Phaser.Types.Core.GameConfig & {
          colyseusServer: ColyseusServerPluginConfig;
        }
      );
    }
  }
}

export interface ColyseusServerPluginConfig {
  /**
   * Colyseus Websocket Server Address
   */
  serverEndpoint: `${"ws" | "wss"}://${string}` | EndpointSettings;
  /**
   * Ticks Per Second
   * @default 60
   */
  tps?: number;
}

// const test: Phaser.Types.Core.GameConfigA[""];
export class ColyseusServerPlugin extends Phaser.Plugins.ScenePlugin {
  public readonly config = this.scene.game.config.colyseusServer;

  public readonly loop: TickLoop;

  readonly tps = 60;
  readonly mspt = 1000 / this.tps;

  constructor(
    scene: Phaser.Scene,
    pluginManager: Phaser.Plugins.PluginManager,
    pluginKey: string
  ) {
    super(scene, pluginManager, pluginKey);

    /**
     * Create Loop
     */
    this.loop = new TickLoop(this.tps, this.onTick.bind(this));
  }

  boot(): void {
    /**
     * Start once scene starts
     */
    this.systems.events.once(Phaser.Scenes.Events.CREATE, () =>
      this.loop.start()
    );
  }

  private onTick(delta: number, tick: number) {
    this.scene.fixedTick?.(delta, tick);
  }

  get tick() {
    return this.loop.tick;
  }

  destroy(): void {
    super.destroy();
  }
}

const Config: Phaser.Types.Core.PluginObjectItem = {
  key: "ColyseusServerPlugin",
  mapping: "colyseusServer",
  plugin: ColyseusServerPlugin,
  start: true,
};
export default Config;
