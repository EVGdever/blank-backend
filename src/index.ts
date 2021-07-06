import {createConnection} from "typeorm"
const bodyParser = require('body-parser')
const express = require("express")
const multer = require("multer")
const http = require("http")
const cors = require('cors')
const path = require('path')

const app = express()
const server = http.createServer(app)

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "images");
    },
    filename: (req, file, cb) =>{
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, new Date().getTime()+'.'+extension);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"||
        file.mimetype === "image/jpeg"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

const connections = {}

// DB connection
export default createConnection().then(async connection => {
    // Router setup
    app.use('/images', express.static(path.resolve(__dirname, '../images')))
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use(cors())
    app.use(multer({
        storage:storageConfig,
        fileFilter: fileFilter
    }).single('file'));
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/profile', require('./routes/profile.routes'));

    // Server start
    const port = process.env.PORT || 5000
    server.listen(port, () => console.log("server is running on port: "+port))
}).catch(error => console.log(error));