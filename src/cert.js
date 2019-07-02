const server = require("./server")
const router = require("./router")
const requestHandlers = require("./requestHandlers")

const handle = {
    "/.well-known/acme-challenge/certificateString": requestHandlers.readCertificate
}

server.start(router.route, handle)

/*
Module is startpoint.
handle{} is a lookuptable of all paths that may be requested during runtime; each path is associated with an action.

Initialize: route, handle
Pass-forward: route, handle
*/