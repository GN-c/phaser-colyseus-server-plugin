import { SimulationCallback } from "@colyseus/core/build/Room";
import { Room, Client } from "colyseus";
import { InputData, MyRoomState, Player } from "./Part4State";

export class Part4Room extends Room<MyRoomState> {
  fixedTimeStep = 1000 / 60;

  onCreate(options: any) {
    this.setState(new MyRoomState());

    // set map dimensions
    this.state.mapWidth = 800;
    this.state.mapHeight = 600;

    this.onMessage(0, (client, input) => {
      // handle player input
      const player = this.state.players.get(client.sessionId);

      // enqueue input to user input buffer.
      player.inputQueue.push(input);
    });
    this.setPatchRate(this.fixedTimeStep);
    this.setSimulationInterval(
      (deltaTime) => this.fixedTick(deltaTime),
      this.fixedTimeStep
    );
  }

  fixedTick(delta: number) {
    const velocity = 2; //120 * (delta / 1000);

    this.state.players.forEach((player) => {
      let input: InputData;

      // dequeue player inputs
      while ((input = player.inputQueue.shift())) {
        if (input.left) {
          player.x -= velocity;
        } else if (input.right) {
          player.x += velocity;
        }

        if (input.up) {
          player.y -= velocity;
        } else if (input.down) {
          player.y += velocity;
        }

        // player.tick = input.tick;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();
    player.x = Math.random() * this.state.mapWidth;
    player.y = Math.random() * this.state.mapHeight;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  private _elapsedTime = 0;
  setSimulationInterval(
    onTickCallback: SimulationCallback,
    targetDeltaTime: number
  ): void {
    super.setSimulationInterval((deltaTime) => {
      this._elapsedTime += deltaTime;

      while (this._elapsedTime >= targetDeltaTime) {
        this._elapsedTime -= targetDeltaTime;
        onTickCallback(targetDeltaTime);
      }
    });
  }
}
