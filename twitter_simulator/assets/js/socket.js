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
      messageItem.innerText = `${username.value} logged in `
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
        messageItem.innerText = `${username.value} subscribed to ${val}`
        messageContainer.appendChild(messageItem)
        subscribe.value = ""
    }
  })
 

  /**event listener to  send tweets*/
sendtweet.addEventListener("keypress", event => {
    if (event.keyCode === 13){
        sendTweet(sendtweet.value, username.value)
        let messageItem = document.createElement("li");
        messageItem.innerText = `${username.value} tweeted: ${sendtweet.value}`
        messageContainer.appendChild(messageItem)
        sendtweet.value = ""
    }
  })


channel.on("new_tweet", payload => {
    //let followersList = payload.followerList;
    var followersList = new Set(payload.followerList)
    console.log({follower_list: followersList})
    let messageItem = document.createElement("li");
    if(followersList.has(username.value)){
      console.log("in the if")
      messageItem.innerText = `${payload.uid} tweeted:  ${payload.body}`
      let retweetButton = document.createElement("button");
      messageContainer.appendChild(messageItem)
      messageContainer.appendChild(retweetButton)
      retweetButton.innerText="retweet"
      retweetButton.style.display = "inline"
      retweetButton.addEventListener('click', ()=> {
        channel.push("retweet", {user_id: username.value, tweet_owner: payload.uid, retweet_text: payload.body})
      })
    }
  })

  channel.on("re_tweet", payload => {
    var followersList = new Set(payload.followerList)
    console.log({follower_list: followersList})
    let messageItem = document.createElement("li");
    if(followersList.has(username.value)){
      console.log("in the if")
      messageItem.innerText = `${payload.uid} re-tweeted:  ${payload.tweet_owner}'s tweet: ${payload.body}`
      messageContainer.appendChild(messageItem)
    }
  })



  search_hashtag.addEventListener("keypress", event => {
    if (event.keyCode === 13){
        channel.push("search_hashtag", {username: username.value, hashtag: search_hashtag.value})
      
        console.log({username: username.value, hashtag: search_hashtag.value, time: `${Date()}`})
        search_hashtag.value = ""
    }
  })

  channel.on("query_hashtag", tweets => {
    var messageItem = document.createElement("li");
    var tw_list =  tweets.tweets_list;
    messageItem.innerHTML = `searched hashtag's tweets are: <br />`
    //messageContainer.appendChild(messageItem)
   for(var i=0; i < tw_list.length ; i++) {
      messageItem.innerHTML = messageItem.innerHTML + tw_list[i] + "<br />"
      messageContainer.appendChild(messageItem)
    }
  })

  search_mentions.addEventListener("keypress", event => {
    if (event.keyCode === 13){
        channel.push("search_mention", {username: username.value, mention: search_mentions.value})
      
        console.log({username: username.value, mention: search_mentions.value, time: `${Date()}`})
        search_mention.value = ""
    }
  })

  
  channel.on("query_mention", tweets => {
    var messageItem = document.createElement("li");
    var tw_list =  tweets.mention_tweets_list;
    messageItem.innerHTML = `searched mention tweets are: <br />`
    //messageContainer.appendChild(messageItem)
   for(var i=0; i < tw_list.length ; i++) {
      messageItem.innerHTML = messageItem.innerHTML + tw_list[i] + "<br />"
      messageContainer.appendChild(messageItem)
    }
  })

/**event listener to  search tweets of all 
 * users you have subscribed to*/
document.getElementById('search_tweets').onclick = function () {
  //var val = document.getElementById('search_user_tweets').value
  console.log({username: username.value, time: `${Date()}`})
  channel.push("search_tweets_by_user", {username: username.value, time: `${Date()}`})
 }

 channel.on("query_tweets", tweets => {
  var messageItem = document.createElement("li");
  var tw_list =  tweets.user_tweets_list;
  messageItem.innerHTML = `searched user tweets are: <br />`
  //messageContainer.appendChild(messageItem)
 for(var i=0; i < tw_list.length ; i++) {
    messageItem.innerHTML = messageItem.innerHTML + tw_list[i] + "<br />"
    messageContainer.appendChild(messageItem)
  }
})

export default twitter_socket
