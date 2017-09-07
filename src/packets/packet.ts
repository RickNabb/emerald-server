import Engine from '../Server'

/**
 * A namespace for packet interfaces
 * @namespace Packet
 */
namespace Packet {
  /**
   * The incoming packet interface.
   * 
   * @interface In
   */
  export abstract class In {

    /**
     * A string unique id.
     * 
     * @type {string}
     * @memberof In
     */
    id : string

    /**
     * A reference to the emerald engine.
     * 
     * @type {Engine}
     * @memberof In
     */
    engine : Engine

    /**
     * Handle an incoming packet with data.
     * 
     * @param {object} data 
     * @memberof In
     */
    abstract handlePacket(data : object)

    /**
     * Set the engine for this packet.
     * 
     * @param {Engine} engine 
     * @memberof In
     */
    setEngine(engine : Engine) {
      this.engine = engine
    }
  }

  export interface Out {

    /**
     * A string unique id.
     * 
     * @type {string}
     * @memberof Out
     */
    id : string

    /**
     * Send data through the SocketIO connection.
     * 
     * @param {SocketIO.Socket} socket The socket to send data through.
     * @param {object} data The data to send.
     * @memberof Out
     */
    send(socket : SocketIO.Socket, data : object)
  }
}

export { Packet }