import { Schema } from "@colyseus/schema";
import createUniqueProperty from "./utils/createUniqueProperty";
import { LISTENERS_PROPERTY } from "./decorators/listen";
import { SYNCABLES_PROPERTY } from "./decorators/sync";
import type { EndpointSettings } from "colyseus.js/lib/Client";
import Client from "./client";
import Queue from "./utils/queue";
import { calculateProgress } from "./utils/math";

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
    }
    namespace Scenes {
      interface Systems {
        /**
         * Colyseus Server Manager Plugin
         */
        colyseusServer: ColyseusServerPlugin;
      }
    }
  }
}

export type Snapshot<T extends any = any> = { value: T; time: number };

export interface ColyseusClientConfig {
  /**
   * Colyseus Websocket Server Address
   */
  serverEndpoint: `${"ws" | "wss"}://${string}` | EndpointSettings;
}

export interface ColyseusRoomConfig {
  method: "consumeSeatReservation" | "create";
}

export class ColyseusServerPlugin extends Phaser.Plugins.ScenePlugin {
  private readonly linkedObjects = new Map<
    object,
    {
      schema: Schema;
      syncableQueues: Record<string, Queue<Snapshot>>;
      unlinkCallback(): void;
    }
  >();

  /**
   * Colyseus Client
   *
   * Avaliable if created by `colyseusServer.createClient`
   */
  public client?: Client;

  constructor(
    scene: Phaser.Scene,
    pluginManager: Phaser.Plugins.PluginManager,
    pluginKey: string
  ) {
    super(scene, pluginManager, pluginKey);
  }

  boot(): void {
    this.scene.events.on(Phaser.Scenes.Events.START, this.start, this);
  }

  start() {
    this.scene.events.on(Phaser.Scenes.Events.PRE_UPDATE, this.preUpdate, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  /**
   * Create Colyseus client
   */
  createClient({ serverEndpoint }: ColyseusClientConfig) {
    this.client = new Client(serverEndpoint);
    return this.client;
  }

  private preUpdate(time: number, delta: number) {
    this.linkedObjects.forEach(({ schema, syncableQueues }, object) => {
      /**
       * Update syncable properties
       */
      const syncables = SYNCABLES_PROPERTY.get(object);
      if (syncables)
        for (const {
          propertyKey,
          schemaKey,
          interpolationFunction,
        } of syncables) {
          const queue = syncableQueues[schemaKey];
          if (queue.isEmpty) continue;

          const { first: snapshotA, last: snapshotB } = queue;
          // console.log(
          //   calculateProgress(time - 50, snapshotA.time, snapshotB.time)
          // );
          const progress = calculateProgress(
            this.now - 50,
            snapshotA.time,
            snapshotB.time,
            true
          );
          // console.log(this.now - 100 > snapshotB.time);

          object[propertyKey] = interpolationFunction(
            object[propertyKey],
            snapshotB.value,
            0.2
          );
        }
    });
  }

  /**
   * Link Schema With Gameobject
   *
   * Properties linked with `sync` and `listen` will update according to this schema
   * @param object Phaser.GameObjects.GameObject
   * @param schema Schema
   */
  public linkSchema(object: object, schema: Schema) {
    /**
     * Unlink existing schema
     */
    this.unlinkSchema(object);

    /**
     * Retrieve Saved data from object
     */
    const listeners = LISTENERS_PROPERTY.get(object);
    const syncables = SYNCABLES_PROPERTY.get(object);

    /** Create queues for saving data for each syncable schema property */
    const syncableQueues: Record<string, Queue<Snapshot>> = {};
    syncables?.forEach(
      ({ schemaKey }) => (syncableQueues[schemaKey] = new Queue(2))
    );

    /**
     * Listen for changes and fire methods marked with `@listen`
     */
    const onChangeDisposeCallback = schema.onChange((changes) => {
      for (const { field: schemaKey, previousValue, value } of changes) {
        /**
         * Iterate through changes and fire listener callbacks if we have registered any
         */
        listeners?.[schemaKey]?.forEach((callback) =>
          callback.call(object, previousValue, value)
        );

        /**
         * Save Snapshot for schema property if needed
         */
        syncableQueues[schemaKey]?.add({ value, time: this.now });
      }
    });

    /**
     * Save Linked object
     */
    this.linkedObjects.set(object, {
      schema,
      syncableQueues,
      unlinkCallback: () => {
        onChangeDisposeCallback();
      },
    });
  }

  public unlinkSchema(object: object) {
    /** Get Data */
    const data = this.linkedObjects.get(object);

    /** Stop if data does not exist, object is not linked yet */
    if (!data) return;

    /** Call unlink callback */
    data.unlinkCallback();

    /**
     * Unlink object
     */
    this.linkedObjects.delete(object);
  }

  private shutdown() {
    this.scene.events.off(
      Phaser.Scenes.Events.PRE_UPDATE,
      this.preUpdate,
      this
    );

    /**
     * Unlink every object
     */
    this.linkedObjects.forEach((_, object) => this.unlinkSchema(object));
  }

  destroy(): void {
    super.destroy();
    this.shutdown();
    this.scene.events.off(Phaser.Scenes.Events.START, this.start, this);
  }

  get now() {
    return this.game.loop.now;
  }
}

const Config: Phaser.Types.Core.PluginObjectItem = {
  key: "ColyseusServerPlugin",
  mapping: "colyseusServer",
  plugin: ColyseusServerPlugin,
  start: true,
};
export default Config;
