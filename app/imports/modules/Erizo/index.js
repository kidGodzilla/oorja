import Room from './Room';
import { LicodeEvent, RoomEvent, StreamEvent } from './Events';
import Stream from './Stream';
import Logger from './utils/Logger';


const Erizo = {
  Room: Room.bind(null, undefined, undefined),
  LicodeEvent,
  RoomEvent,
  StreamEvent,
  Stream: Stream.bind(null, undefined),
  Logger,
};

export default Erizo;
