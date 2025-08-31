import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";
import { AuthContext } from "./AuthContext";
import { useEffect } from "react";
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { socket, axios } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});


    useEffect(() => {
        getUsers();
    }, []);

    console.log("users from ChatContext:", users);



    // function to get all user for side bar

    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            console.log("API response:", data);
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(prev => ({
                    ...prev,
                    ...data.unseenMessages
                }));
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // fuction to get messages the selected user

    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to send message the selected user

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to subscribe to messages for selected user

    const subscribeToMessage = async () => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages, [newMessage.senderId]:
                        prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    // functio  to unsubscribe from messages

    const unsubscribeFromMessages = () => {
        if (socket) {
            socket.off("newMessage");
        }
    };
    useEffect(() => {
        subscribeToMessage();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages
        , setUnseenMessages
    }
    return (
        <ChatContext.Provider value={value} >
            {children}
        </ChatContext.Provider>
    )
}


