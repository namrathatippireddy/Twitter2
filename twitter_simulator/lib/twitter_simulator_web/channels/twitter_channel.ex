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
     if(userToSub!=user_id) do
       GenServer.call(:server, {:subscribe_user, userToSub, user_id})
       push socket, "subscribed",  %{"user_id" => user_id}
     end
    {:reply, :subscribe_user, socket}
   end

end
