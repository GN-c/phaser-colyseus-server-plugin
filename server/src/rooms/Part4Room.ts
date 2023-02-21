import { SimulationCallback } from "@colyseus/core/build/Room";
import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "./Part4State";

export class Part4Room extends Room<MyRoomState> {
  onCreate(options: any) {
    this.setState(new MyRoomState());

    this.onMessage(0, (client, { x, y, rotation }) => {
      const player = this.state.players.get(client.sessionId);
      player.x = x;
      player.y = y;
      player.rotation = rotation;
    });
    this.setPatchRate(1000 / 60);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
