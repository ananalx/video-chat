import Peer from "simple-peer";

class CustomPeer extends Peer {
  username: string;
  peerID: string;

  constructor(config: Peer.Options, username: string, peerID: string) {
    super(config);
    this.username = username;
    this.peerID = peerID;
  }
}

export default CustomPeer;
