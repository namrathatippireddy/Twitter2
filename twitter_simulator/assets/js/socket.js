// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket,
// and connect at the socket path in "lib/web/endpoint.ex".
//
// Pass the token on params as below. Or remove it
// from the params if you are not using authentication.
import {Socket} from "phoenix"

let messageContainer = document.querySelector('#messages')
let twitter_socket = new Socket("/socket", {params: {token: window.userToken}})
let username = document.querySelector('#username')
let subscription = document.querySelector('#subscribe')
let search_user_tweets = document.querySelector('#search_user_tweets')

twitter_socket.connect()
// Now that you are connected, you can join channels with a topic:
let channel = twitter_socket.channel("room:lobby", {})
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

function register_users(userName){
    //register the new client
    channel.push("register", userName)
    .receive("registered_user" , resp => console.log("registered", resp))
}

//give subscribers to each client
function subscribe_user(user_id, subscribeUser) {
    channel.push("subscribe", {user_id: user_id, userToSub: subscribeUser})
    .receive("subscribed", resp => console.log("subscribed", user_id))
    console.log({username: user_id, usersToSub: subscribeUser})
}

/**function to send tweets */

 function sendTweet(tweet_text, user_id){

    channel.push("tweet_user_subscribers", {tweetText: tweet_text, username: user_id, time: `${Date()}`})
    console.log( {tweetText: tweet_text, username: user_id, time: `${Date()}`})
 }

/**event listener to  register username**/
username.addEventListener("keypress", event => {
  if (event.keyCode === 13){
      register_users(username.value)
      let messageItem = document.createElement("li");
      messageItem.innerText = `${username.value} logged in at [${Date()}]`
      messageContainer.appendChild(messageItem)
      //username.value = ""
  }
})

/**event listener to perform a user subscription*/
subscription.addEventListener("keypress", event => {
    if (event.keyCode === 13){
        var val = document.getElementById('subscribe').value
        subscribe_user(username.value, val)
        let messageItem = document.createElement("li");
        messageItem.innerText = `${username.value} subscribed to ${val} at [${Date()}]`
        messageContainer.appendChild(messageItem)
        subscribe.value = ""
    }
  })

search_hashtag.addEventListener("keypress", event => {
    if (event.keyCode === 13){
        channel.push("search_hashtag", {username: username.value, hashtag: search_hashtag.value})
        .receive("query_hashtag", resp => console.log("query_hashtag", tweets_list))
        console.log({username: username.value, hashtag: search_hashtag.value, time: `${Date()}`})
        search_hashtag.value = ""
    }
  })

  /**event listener to  send tweets*/
sendtweet.addEventListener("keypress", event => {
    if (event.keyCode === 13){
        sendTweet(sendtweet.value, username.value)
        let messageItem = document.createElement("li");
        messageItem.innerText = `${username.value} tweeted: ${sendtweet.value} at [${Date()}]`
        messageContainer.appendChild(messageItem)
        sendtweet.value = ""
    }
  })

channel.on("query_hashtag", payload => {
    let messageItem = document.createElement("li");
    messageItem.innerText = `search hashtag tweet is: ${payload.tweets_list}`
    messageContainer.appendChild(messageItem)
  })

channel.on("new_tweet", payload => {
    //let followersList = payload.followerList;
    var followersList = new Set(payload.followerList)
    console.log({follower_list: followersList})
    let messageItem = document.createElement("li");
    if(followersList.has(username.value)){
      console.log("in the if")
      messageItem.innerText = `${payload.uid} Tweeted ${payload.body}  [${Date()}]`
      messageContainer.appendChild(messageItem)
    }
  })






export default twitter_socket
