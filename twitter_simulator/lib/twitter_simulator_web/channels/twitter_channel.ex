defmodule TwitterSimulatorWeb.TwitterChannel do
    use Phoenix.Channel

    def join("room:lobby", _message, socket) do
       {:ok, socket}
   end
   def join("room:"<> _private_room_id, _params, _socket) do
       {:error, %{reason: "unauthorized"}}
   end

   #handle to register clients
   def handle_in("register", user_id, socket) do
     GenServer.call(:server, {:register_users, user_id})
     push socket, "registered_user",  %{"user_id" => user_id}
     {:reply, :register_users, socket}
   end

   def handle_in("subscribe", data, socket) do
    user_id = data["user_id"]
    userToSub = data["userToSub"]
     if(userToSub != user_id) do
       GenServer.call(:server, {:subscribe_user, userToSub, user_id})
       push socket, "subscribed",  %{"user_id" => user_id}
     end
    {:reply, :subscribe_user, socket}
   end

   def handle_in("search_hashtag", params, socket) do
     #{username: userNamesList[i], hashtagList: hashtagList, time: `${Date()}`}
     IO.inspect ["--------------------------------"]
     user_id = params["username"]
     searchHashtag = params["hashtag"]
     tweets_for_hashtag = GenServer.call(:server, {:search_hashtags, user_id, searchHashtag})
     IO.inspect "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa"
     IO.inspect(tweets_for_hashtag)
     push socket, "query_hashtag",  %{"tweets_list" => tweets_for_hashtag}
     {:noreply, socket}
   end

   def handle_in("tweet_user_subscribers", payload, socket) do
      tweet_text = payload["tweetText"]
      user_id = payload["username"]
      follower_list = GenServer.call(:server, {:handle_tweet, user_id, user_id, tweet_text})
      #IO.inspect("this is the follower list #{follower_list} **************************************")
      #GenServer.cast(:server, {:handle_tweet, user_id, user_id, tweet_text, socket})
      broadcast socket, "new_tweet", %{uid: user_id, body: tweet_text,followerList: follower_list}
      {:noreply, socket}
  end

  def handle_in("search_mention", params, socket) do
    #{username: userNamesList[i], hashtagList: hashtagList, time: `${Date()}`}
    #IO.inspect ["--------------------------------"]
    user_id = params["username"]
    searchMention = params["mention"]
    tweets_for_mention = GenServer.call(:server, {:search_mentions, user_id, [searchMention]})
    IO.inspect "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
    IO.inspect(tweets_for_mention)
    push socket, "query_mention",  %{"mention_tweets_list" => tweets_for_mention}
    {:noreply, socket}
  end


  def handle_in("search_tweets_by_user", params, socket) do
    userName = params["username"]
    tweetList_for_user=GenServer.call(:server, {:get_subscribed_tweets, userName})
    push socket, "query_tweets",  %{"user_tweets_list" => tweetList_for_user}
    {:noreply, socket}
  end

  def handle_in("retweet", params, socket) do
    user_id = params["user_id"]
    retweet_text = params["retweet_text"]
    tweet_owner = params["tweet_owner"]
    follower_list = GenServer.call(:server, {:handle_retweet, user_id, tweet_owner, retweet_text})
    #IO.inspect("this is the follower list #{follower_list} **************************************")
    #GenServer.cast(:server, {:handle_tweet, user_id, user_id, tweet_text, socket})
    broadcast socket, "re_tweet", %{uid: user_id, tweet_owner: tweet_owner, body: retweet_text, followerList: follower_list}
    {:noreply, socket}
  end
end
