const http = require("http")
const url = require("url")

function start(route, handle){
    function onRequest(request, response) {
        const pathname = url.parse(request.url).pathname
        console.log("Request received for " + pathname)
        route(handle, pathname, response)
    }
    //Port set to 8080 for testing. HTTP port is 80.
    http.createServer(onRequest).listen(8080)
    console.log("Server running.")
}

exports.start = start
