import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set('view engine',"pug");
app.set("views",__dirname + "/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(req,res)=> res.render("home"));
app.get("/*", (_,res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app); // http 서버
const wss = new WebSocket.Server({ server }); // ws 서버

wss.on("connection",(socket) =>{
    console.log("Connected to Browwer✅");
    socket.on("close",()=>console.log("DisConnected to Browser❌"));
    socket.on("message",(message)=>{
        console.log(message.toString());
    });
    socket.send("hello!!!");
    
});

server.listen(3000, handleListen);
