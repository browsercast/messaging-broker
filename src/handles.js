const { db, peers } = require('./db');
const handles = {
    newPeer: (socketId) => {
        const peer = peers
            .insert({
                socketId
            })
            .write();
        return peer.id;
    },
    deletePeer: (socketId) => {
        peers.remove({ socketId }).write();
    }
};
module.exports = handles;
