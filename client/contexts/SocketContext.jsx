import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    // Strictly enforce NO connection without user + token
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize with autoConnect: false for precise control
    const newSocket = io(window.location.origin, {
      autoConnect: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 5000, // Less aggressive reconnection
      transports: ["websocket"],
      auth: {
        token: token
      }
    });

    // Manually connect
    newSocket.connect();

    newSocket.on("connect", () => {
      console.log("🔌 Real-time Engine: Active (Authenticated)");
      if (user.role !== "student") {
        newSocket.emit("join-dashboard");
      }
    });

    setSocket(newSocket);

    // Deep cleanup on unmount or user change
    return () => {
      console.log("🔌 Real-time Engine: Shutting down");
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
