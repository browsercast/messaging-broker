const server = require('http').createServer();
var io = require('socket.io')(server, { origins: '*:*'});
const handles = require('./handles');
const { peers, uids } = require('./db');

io.origins('*:*')

io.on('connection', (socket) => {
    const appId = handles.newPeer(socket.id);
    var extId = false;

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
        handles.newUid(data);
    });

    // check uid and return socket
    socket.on('joined-id-social-check', (data) => {
        console.log(data);
        const uid = uids.getById(data);
        if (rec) {
            io.to(rec.socketId).emit('user-disconnected');
        }
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
        if (extId != false) {
            const rec = peers.getById(extId).value();
            if (rec) {
                io.to(rec.socketId).emit('user-disconnected');
            }
            handles.deletePeer(socket.id);
            // ToDo delete uid
        }
    });
});

server.listen(process.env.PORT || 3000);
