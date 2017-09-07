/**
* packetManager.js
* A file to serve as a master manager for all packets
* the app will have to interact with.
*/

import Engine from './Server'
import { Connection } from './packets/in/connection'
import { FsExtensions } from './utils/fsExt'
import { Packet } from './packets/packet'
import * as fs from 'fs'
import * as promise from 'promise'

namespace Emerald {

  export abstract class MasterPacketManager {

    public packets
    protected engine : Engine
    private socket : SocketIO.Socket
    private connection : Connection

    constructor (engine : Engine) {
      this.engine = engine
      this.connection = new Connection(this.engine)
      this.packets = { in: {}, out: {} }
    }

    protected initConnection() {
      this.connection.init()
    }

    /**
     * Send a packet through the socket.
     * @param  {object} packet The packet module we want to use.
     * @param  {object} data   Any data the packet needs.
     */
    public send(packet, data) {
      this.engine.debug.log('emitting ' + packet.id + ': ' + JSON.stringify(data))
      packet.send(this.socket, data)
    }

    /**
     * Set the socket we want to use for outgoing packets.
     * @param  {object} _socket The socketIO instance to use.
     */
    public setSocket(_socket) {
      this.socket = _socket
    }

    /**
     * Generate a packet manifest JSON file to serve up
     * to the client.
     * @return {Promise} resolves to nothing
     */
    public generatePacketManifest() {
      fs.writeFile(__dirname + '/packets/manifest.json', JSON.stringify(this.packets), 'utf8', (err) => {
        if (err) this.engine.debug.error(err)
      })
    }

    /**
     * Initialize a new socket connection by registering all
     * the packets the application will need to handle.
     * @param  {object} socket The SocketIO instance
     */
    public initSocket(socket) {
      let packet
      this.engine.managers.packetManager.setSocket(socket)
      for (packet in this.packets.server.in) {
        socket.on(packet, this.packets.server.in[packet].handlePacket)
      }
    }

    /**
     * Register packets in the /packets/* directories
     * so they can be accessed through this manager in the future.
     * They are stored in the packets dictionary.
     */
    public registerPackets() {
      // return new Promise(async (resolve, reject) => {
      //   let _packets = {
      //     client: { "in": [], "out": [] },
      //     server: { "in": {}, "out": {} }
      //   }
      //   let promises = []
      //   let packetDir = this.engine.configDir + this.engine.config.packetDir + 'in'
      //   const files = await FsExtensions.readdirPromise(packetDir)
      //   files.filter((file) => {
      //     return file !== 'connection.js'
      //   }).reduce((accum, cur) => {
      //     console.log(cur)
      //     accum.push(this.registerServerPacket(packetDir, cur))
      //   }, promises)
      //   // promises.push(this.registerServerPackets(_packets.server.out, packetDir + "out"))
      //   console.log(promises)
      //   // promises.push(this.registerServerPackets(_packets.server.in, packetDir + "in"))
      //   await Promise.all(promises)
      //     .catch(err => this.engine.debug.error(err))
      //   console.log(_packets)
      //   resolve(_packets)
      // })
    }

    /**
     * Register all of the client packets with the socket.
     * @param  {object} container Either the packets.client.in or
     * packets.client.out object.
     * @param  {string} dir       The directory to search for client packets
     * in.
     */
    // public registerClientPackets(container, dir) {
    //   return new Promise(async (resolve, reject) => {
    //     let files, file, index
    //     files = await FsExtensions.readdirPromise(dir)
    //     for (index in files) {
    //       file = files[index]
    //       container.push(file.replace('.js', ''))

    //       // Debugging
    //       // engine.debug.log('Registered client packet ' + file)
    //     }
    //     resolve()
    //   })
    // }

    /**
     * Register all of the server packets with the socket.
     * @param {Packet.In | Packet.Out} packet The packet to register.
     */
    public registerServerPacket(packet : Packet.In | Packet.Out) {
      if (packet instanceof Packet.In) {
        this.packets.in[packet.id] = packet
      } else {
        this.packets.out[packet.id] = packet
      }
    }
  }
}

export default Emerald.MasterPacketManager