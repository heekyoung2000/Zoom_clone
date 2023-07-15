const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload){
    const msg = {type, payload} //object
    return JSON.stringify(msg); // string
}

socket.addEventListener("open",() => {
    console.log("Connected to server✅");
});

// socket.addEventListener("message",(message)=>{
//     console.log("Just got this: ", message.data, " from the Server");
// });

socket.addEventListener("message",(message)=>{
    // console.log("New message: ", message.data);
    const li = document.createElement("li");
    li.innerText= message.data;
    messageList.append(li);
});


socket.addEventListener("close",()=>{
    console.log("DisConnected to server❌");
});

// setTimeout(() => {
//     socket.send('hello from the browser!'); //frontend가 back-end로 메세지를 보냄
// }, 10000)

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText= `You: ${input.value}`;
    messageList.append(li);
    input.value="";
}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
    input.value="";
}


messageForm.addEventListener("submit",handleSubmit);
nickForm.addEventListener("submit",handleNickSubmit);
