import * as Colyseus from "colyseus.js";
import { Room } from "colyseus.js";
import { SchemaConstructor } from "colyseus.js/lib/serializer/SchemaSerializer";

export enum Events {
  ROOM_CREATED,
}

export default class Client extends Colyseus.Client {
  readonly events = new Phaser.Events.EventEmitter();

  createRoom<T>(roomName: string, rootSchema?: SchemaConstructor<T>): Room<T> {
    const room = super.createRoom<T>(roomName, rootSchema);

    return room;
  }
}
