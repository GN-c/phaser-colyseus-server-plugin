import Phaser from "phaser";
import { Room, Client, SchemaSerializer } from "colyseus.js";
import { BACKEND_URL } from "../backend";
import type { MyRoomState } from "../../../server/src/rooms/Part4State";
import Player from "./player";

export class Part4Scene extends Phaser.Scene {
  room: Room;

  currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  playerEntities: {
    [sessionId: string]: Player;
  } = {};

  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "part4" });
  }

  preload() {
    this.load.image(
      "ship_0001",
      "https://cdn.glitch.global/3e033dcd-d5be-4db4-99e8-086ae90969ec/ship_0001.png?v=1649945243288"
    );
    console.log("preload");
  }

  async create() {
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    // connect with the room
    await this.connect();

    this.room.state.players.onAdd((player, sessionId) => {
      // const entity = this.physics.add.image(player.x, player.y, "ship_0001");
      // this.playerEntities[sessionId] = entity;
      // is current player
      if (sessionId === this.room.sessionId) {
        this.currentPlayer = this.physics.add.image(
          player.x,
          player.y,
          "ship_0001"
        );

        player.onChange(() => {});
      } else {
        const entity = new Player(this);
        console.log(entity);
        this.playerEntities[sessionId] = entity;

        this.colyseusServer.linkSchema(entity, player);
      }
    });
    // remove local reference when entity is removed from the server
    this.room.state.players.onRemove((player, sessionId) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();

        this.colyseusServer.unlinkSchema(entity);
        delete this.playerEntities[sessionId];
      }
    });

    // this.cameras.main.startFollow(this.ship, true, 0.2, 0.2);
    // this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, 800, 600);
  }

  async connect() {
    this.colyseusServer.createClient({
      serverEndpoint: BACKEND_URL,
    });

    this.room = await this.colyseusServer.client.joinOrCreate("part4_room", {});
  }

  update(time: number, delta: number): void {
    if (this.currentPlayer) {
      const velocity = 100;
      if (this.cursorKeys.left.isDown) {
        this.currentPlayer.setVelocityX(-velocity);
      } else if (this.cursorKeys.right.isDown) {
        this.currentPlayer.setVelocityX(velocity);
      } else this.currentPlayer.setVelocityX(0);

      if (this.cursorKeys.up.isDown) {
        this.currentPlayer.setVelocityY(-velocity);
      } else if (this.cursorKeys.down.isDown) {
        this.currentPlayer.setVelocityY(velocity);
      } else this.currentPlayer.setVelocityY(0);

      this.currentPlayer.setRotation(
        Phaser.Math.Angle.RotateTo(
          this.currentPlayer.rotation,
          Phaser.Math.TAU + this.currentPlayer.body.velocity.angle(),
          0.2
        )
      );

      this.room.send(0, {
        x: this.currentPlayer.x,
        y: this.currentPlayer.y,
        rotation: this.currentPlayer.rotation,
      });
    }

    // entity.x = Phaser.Math.Linear(entity.x, entity.getData("serverX"), 0.2);
  }

  // fixedTick(delta: number, tick: number) {
  //   // console.log(delta);
  //   // skip loop if not connected yet.
  //   if (this.currentPlayer) {
  //     this.inputPayload.left = this.cursorKeys.left.isDown;
  //     this.inputPayload.right = this.cursorKeys.right.isDown;
  //     this.inputPayload.up = this.cursorKeys.up.isDown;
  //     this.inputPayload.down = this.cursorKeys.down.isDown;
  //     this.room.send(0, this.inputPayload);
  //     const velocity = 2;
  //     // console.log(velocity);

  // if (this.inputPayload.left) {
  //   this.currentPlayer.x -= velocity;
  // } else if (this.inputPayload.right) {
  //   this.currentPlayer.x += velocity;
  // }

  // if (this.inputPayload.up) {
  //   this.currentPlayer.y -= velocity;
  // } else if (this.inputPayload.down) {
  //   this.currentPlayer.y += velocity;
  // }

  //     this.localRef.x = this.currentPlayer.x;
  //     this.localRef.y = this.currentPlayer.y;
  //   }
  //   // console.log("tick");

  //   // const currentPlayerRemote = this.room.state.players.get(
  //   //   this.room.sessionId
  //   // );
  //   // const ticksBehind = tick - currentPlayerRemote.tick;
  //   // console.log({ ticksBehind });
  // }
}
