import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set('view engine',"pug");
app.set("views",__dirname + "/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(req,res)=> res.render("home"));
app.get("/*", (_,res) => res.redirect("/"));


const httpServer = http.createServer(app); // http 서버
// const wss = new WebSocket.Server({ httpServer}); // ws 서버
const wsServer = SocketIO(httpServer); //io 서버

function publicRooms(){ //publicRoom만 서버에서 출력함
    const{
        sockets:{
            adapter:{sids,rooms}, //wsServer.sockets.adapter로부터 sids와 rooms를 가져옴
        },
    }=wsServer;
    const publicRooms = [];
    rooms.forEach((_,key)=>{
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) =>{
    socket["nickname"]="Anon";
    socket.onAny((event)=>{
        console.log(wsServer.sockets.adapter);
        console.log(`Socket Event:${event}`);
    });
    socket.on("enter_room",(roomName,done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change",publicRooms());
    });
    socket.on("disconnecting",() => {
        socket.rooms.forEach((room) => 
        socket.to(room).emit("bye",socket.nickname, countRoom(room)-1)
        );
        wsServer.sockets.emit("room_change",publicRooms());
    });
    socket.on("disconnect",()=>{
        wsServer.sockets.emit("room_change",publicRooms());
    });
    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
    socket.on("nickname",nickname => (socket["nickname"]=nickname));
}); 


// function onSocketClose(){
//     ()=>console.log("DisConnected to Browser❌"); 
// }

// const sockets = []; //배열로 만들어서 여러 브라우저에 메세지 전달

// wss.on("connection",(socket) =>{ //connection event listen
//     sockets.push(socket);//배열에 socket(브라우저) 넣어줌
//     socket["nickname"] = "Anon"; 
//     console.log("Connected to Browwer✅");
//     socket.on("close",onSocketClose); //브라우저가닫히면 서버에서 나타남
//     socket.on("message", (msg)=>{
//         const message = JSON.parse(msg);  
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach((aSocket)=> aSocket.send(`${socket.nickname}: ${message.payload}`));
//             case "nickname":
//                 socket["nickname"] = message.payload;
                
//         }
//         // socket.send(message.toString()); //브라우저에 메세지 전달
//         // sockets.forEach((aSocket)=> aSocket.send(message.toString())); // 각 브라우저에 메세지 전달
//     });
// });
const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);



