/**
* disconnect.js
* The disconnect packet incoming from the client..
*/

import { Packet } from '../packet'
import Engine from '../../Server'

class Disconnect extends Packet.In {
  /**
   * An ID to ensure modules loading this packet can get context
   * of what packet it is.
   */
  public id : string = 'disconnect'

  public engine : Engine

  public handlePacket(socket) {
    console.log('A user disconnected')
  }
}

export { Disconnect }