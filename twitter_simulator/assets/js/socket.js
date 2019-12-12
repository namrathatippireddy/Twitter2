// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket,
// and connect at the socket path in "lib/web/endpoint.ex".
//
// Pass the token on params as below. Or remove it
// from the params if you are not using authentication.
import {Socket} from "phoenix"

let messageContainer = document.querySelector('#messages')
let socket = new Socket("/socket", {params: {token: window.userToken}})
let username = document.querySelector('#username')

function register(userName){
    //register the new client
    channel.push("register", userName)
    .receive("registered" , resp => console.log("registered", resp))
}

/**event listener to  register username**/
username.addEventListener("keypress", event => {
  if (event.keyCode === 13){
      register(username.value)
      let messageItem = document.createElement("li");
      messageItem.innerText = `${username.value} logged in at [${Date()}]`
      messageContainer.appendChild(messageItem)
      //username.value = ""
  }
})


socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("room:lobby", {})
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })



export default socket
