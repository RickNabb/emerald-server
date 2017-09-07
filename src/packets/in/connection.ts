/**
* connection.js
* The connection packet incoming from the client.
*/

import * as fs from 'fs'
import * as promise from 'promise'
import { Packet } from '../packet'
import { FsExtensions } from '../../utils/fsExt'
import Engine from '../../Server'

class Connection extends Packet.In {

  public id : string = 'connection'
  public engine : Engine
  private packets

  constructor (engine) {
    super()
    this.engine = engine
  }

  public init() {
    this.setupOnConnect()
  }

  /**
   * handlePacket - Handle the ping packet on the server side.
   *
   * @param  {object} socket Our connection to the SocketIO module.
   */
  public handlePacket(data) {
    console.log(data['datetime'] + ': Ping from client')
  }

  /**
   * onConnect - Code to run when the client connects to
   * the server.
   */
  public setupOnConnect() {
    let _packets
    this.engine.io.on('connection', (socket) => {
      this.engine.debug.log('A user connected')
      this.engine.managers.packetManager.initSocket(socket)
    })   
  }
}

export { Connection }