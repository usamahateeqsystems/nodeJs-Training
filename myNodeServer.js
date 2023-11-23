var http = require('http');
var os = require('os');
var fs = require('fs');

const server = http.createServer(function (rqst, rspn){
    switch (rqst.url)
    {
        case '/':
            rspn.write('NodeJs developer home.\n');
            break;
        case '/osInfo':
            osvals = `Total Memory: ${os.totalmem()}\nhostname: ${os.hostname()}\nPlatform:${os.platform()}`;
            rspn.write(osvals);
            break;
        case '/fileRead':
            const data = fs.readFileSync('myFile.html', 'utf8');
            rspn.write(data + '\n');
            break;

        default:
            rspn.write('No Page found.\n');
            break;
    } 
    rspn.end();
})

server.listen(3334);