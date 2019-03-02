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
    getPeer: (socketId) => {
        peers.find({ socketId }).value();
    },
    deletePeer: (socketId) => {
        peers.remove({ socketId }).write();
    },

    newUid: (uid, peerId, osName) => {        
        var entry = uids.find({ uid });

        if (entry.value() == undefined) {
            // Insert entry
            entry = uids.insert({uid}).write();

            // Assign peerId
            uids.find({ uid }).assign({ peers: [{ peerId: peerId, osName: osName }] }).write();
        } else {
            // Add new peerId
            entry.assign({ peers: entry.value().peers.push({ peerId: peerId, osName: osName }) })
        }
        
        return entry.id;
    },
    getUidSocket: (uid) => {
        return uids.find({ uid }).value();
    },
    deleteUid: (uid) => {
        uids.remove({ uid }).write();
    },
    deletePeer: (uid, peerId) => {
        var entry = uids.find({ uid });

        if (entry.value() != undefined) {
            var peers = entry.value().peers;
            var newPeers = peers.filter(function( obj ) {
                return obj.peerId !== peerId;
            });

            entry.assign({ peers: newPeers }).write();
        }
    }
};

module.exports = handles;
