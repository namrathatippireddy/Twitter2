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
     GenServer.call(:server, {:register_users, user_id, socket})
     push socket, "registered",  %{"user_id" => user_id}
     {:reply, :register_users, socket}
   end
end
