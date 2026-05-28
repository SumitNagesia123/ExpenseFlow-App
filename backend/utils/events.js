import { EventEmitter } from "events";

class FinancialEventBus extends EventEmitter {
  constructor() {
    super();
    this.clients = [];
  }

  // Register an SSE client
  registerClient(res) {
    this.clients.push(res);
    res.on("close", () => {
      this.clients = this.clients.filter(client => client !== res);
    });
  }

  // Send a real-time event to all connected browsers
  emitEvent(type, data) {
    this.emit(type, data);
    
    const payload = JSON.stringify({ type, data });
    this.clients.forEach(client => {
      client.write(`data: ${payload}\n\n`);
    });
  }
}

const eventBus = new FinancialEventBus();
export default eventBus;
