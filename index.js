const express = require('express');
const bodyParser = require('body-parser'); 
const app = express();
const scraping = require('./scraping');

app.get('/',(req,res)=>{
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Documento HTML</title>
    </head>
    <body>
        <h1>Test Scraping</h1>
        <ul>
         <li>/html</li>
         <li>/head</li>
         <li>/body</li>
        </ul>
    </body>
    </html>
    `);
});

app.get('/html', scraping.getHTML);
app.get('/head', scraping.getProcessHEAD);
app.get('/body', scraping.getProcessBODY);

app.listen(3000,()=>{
    console.log("API Corriendo en :   localhost:3000");
});