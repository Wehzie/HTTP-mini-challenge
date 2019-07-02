const fs = require("fs")

function readCertificate(response){
    console.log("Request handler 'readCertificate' was called.")
    fs.readFile("./pasteCertificate.txt", function (err, html){
        if (err) throw err
        response.writeHeader(200, {"Content-Type": "text/html"})
        response.write(html)
        response.end()
    })
}

exports.readCertificate = readCertificate