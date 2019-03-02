const server = require('http').createServer();
var io = require('socket.io')(server, { origins: '*:*'});
const handles = require('./handles');
const { peers, uids } = require('./db');

io.origins('*:*')

io.on('connection', (socket) => {
    var appId = false;
    var extId = false;
    var uid = false;

    appId = handles.newPeer(socket.id);

    // send host peer id
    socket.emit('peer-id', appId);

    socket.on('join', (data) => {
        // app connected
        const rec = peers.getById(data.id).value();
        if (rec) {
            // send to app
            io.to(rec.socketId).emit('join', appId); 

            // send to extension
            extId = data.id;
            socket.emit('join', data.id);
        }
    });

    // save uid
    socket.on('joined-id-social', (data) => {
        uid = data;
        handles.newUid(data, appId, socket.handshake.query.host);
        sendDevices(uid);
    });

    // check uid and return socket
    socket.on('joined-id-social-check', (data) => {
        sendDevices(data);
    });

    // for host, new id joined
    socket.on('joined-id', (data) => {
        extId = data;
    });

    // tranfer info between peers
    socket.on('send', (data) => {
        // data.id is the destination
        if (data.id != null) {
            const rec = peers.getById(data.id).value();
            if (rec) {
                io.to(rec.socketId).emit('receive', data);
            }
        }
    });

    // user disconnected
    socket.on('disconnect', () => {
        if (uid != false) {
            handles.deletePeer(uid, appId);
        }

        if (extId != false) {
            const rec = peers.getById(extId).value();

            if (rec) {
                io.to(rec.socketId).emit('user-disconnected');
            }
            handles.deletePeer(socket.id);
        }

        sendDevices(uid);
    });
});

function sendDevices(id) {
    const uid = handles.getUidSocket(id);

    if (uid) {
        const ids = uid.peers;
        io.emit('peer-id-social', ids);
    }
}

server.listen(process.env.PORT || 3000);
