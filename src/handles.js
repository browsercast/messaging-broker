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

    newUid: (uid, peerId) => {
        uids.remove({ uid });

        console.log("found uid")
        var entry = uids.insert({uid}).write();

        uids.find({ uid }).assign({ peerId: peerId }).write();

        console.log("found uid 1", uids.find({ uid }).value())

        return entry.id;
    },
    getUidSocket: (uid) => {
        return uids.find({ uid }).value();
    },
    deleteUid: (uid) => {
        uids.remove({ uid }).write();
    }
};
module.exports = handles;
