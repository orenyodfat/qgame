import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Create Socket Context
const SocketContext = createContext(null);

// WebSocket Provider Component
export const SocketProvider = ({ children, userId }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!userId) return;

        // Create socket connection
        const newSocket = io("http://localhost:3000", {
            transports: ["websocket"], // Force WebSocket transport
            withCredentials: true, // Allow credentials if needed
        });

        newSocket.emit("register", userId); // Register user
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to server:", newSocket.id);
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        return () => {
            console.log("Socket cleanup triggered");
            newSocket.disconnect(); // Cleanup socket on unmount
        };
    }, [userId]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

// Custom Hook to use Socket
export const useSocket = () => useContext(SocketContext);
