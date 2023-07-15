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

function onSocketClose(){
    ()=>console.log("DisConnected to Browser❌");
}

const sockets = []; //배열로 만들어서 여러 브라우저에 메세지 전달


wss.on("connection",(socket) =>{ //connection event listen
    sockets.push(socket);//배열에 socket(브라우저) 넣어줌
    socket["nickname"] = "Anon"; 
    console.log("Connected to Browwer✅");
    socket.on("close",onSocketClose); //브라우저가닫히면 서버에서 나타남
    socket.on("message", (msg)=>{
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                sockets.forEach((aSocket)=> aSocket.send(`${socket.nickname}: ${message.payload}`));
            case "nickname":
                socket["nickname"] = message.payload;
                
        }
        // socket.send(message.toString()); //브라우저에 메세지 전달
        // sockets.forEach((aSocket)=> aSocket.send(message.toString())); // 각 브라우저에 메세지 전달
    });
});

server.listen(3000, handleListen);

