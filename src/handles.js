const { db, peers, uids } = require('./db');
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
    },
    newUid: (uid) => {
        const entry = uids
            .insert({
                uid
            })
            .write();
        return entry.id;
    },
    deleteUid: (uid) => {
        uids.remove({ uid }).write();
    }
};
module.exports = handles;
