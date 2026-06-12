import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { notificationsApi } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const data = await notificationsApi.getAll();
      const formatted = data.map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type === "violation_alert" ? "error" : n.type === "warning" ? "warning" : "info",
        read: n.isRead,
        time: n.createdAt,
      }));
      setNotifications(formatted);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        id: notification.id || Math.random().toString(),
        read: false,
        time: new Date().toISOString(),
        ...notification,
      },
      ...prev,
    ]);
  }, []);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      if (typeof id === "string" && id.length === 24) {
        await notificationsApi.markRead(id);
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsApi.markAllRead();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      if (typeof id === "string" && id.length === 24) {
        await notificationsApi.delete(id);
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  const archive = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      if (typeof id === "string" && id.length === 24) {
        // Assume API has an archive method or use raw fetch
        await fetch(`/api/notifications/${id}/archive`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` }
        });
      }
    } catch (err) {
      console.error("Failed to archive notification:", err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, remove, archive, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};

export default NotificationContext;

