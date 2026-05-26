import "./styles.css";
import React, { useCallback, useEffect, useRef } from "react";
import ChatPreview from "./components/chatPreview";
import ChatRoom from "./components/chatRoom";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import {
  destroyChatSocket,
  ensureChatSocketConnected,
  setChatSocketHandlers,
} from "../../api/socket";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIos";

const CHAT_MESSAGE_LIMIT = 25;

function findPartnerId(message, myId) {
  return String(message.from) === String(myId)
    ? String(message.to)
    : String(message.from);
}

function prependOlderMessagesToData(prevData, partnerId, olderMessages, hasMore) {
  if (!prevData?.Messages) return prevData;

  const chatKey =
    prevData.Messages[partnerId] != null
      ? partnerId
      : Object.keys(prevData.Messages).find(
          (key) => String(prevData.Messages[key].id) === String(partnerId)
        );

  if (!chatKey) return prevData;

  const chat = prevData.Messages[chatKey];
  const existing = chat.SortedMessages || [];
  const existingIds = new Set(existing.map((entry) => String(entry._id)));
  const uniqueOlder = olderMessages.filter(
    (entry) => !existingIds.has(String(entry._id))
  );

  if (uniqueOlder.length === 0 && chat.hasMore === hasMore) {
    return prevData;
  }

  return {
    ...prevData,
    Messages: {
      ...prevData.Messages,
      [chatKey]: {
        ...chat,
        SortedMessages: [...existing, ...uniqueOlder],
        hasMore,
      },
    },
  };
}

function appendMessageToData(prevData, message, myId) {
  if (!prevData?.Messages) return prevData;

  const partnerId = findPartnerId(message, myId);
  const chat =
    prevData.Messages[partnerId] ||
    Object.values(prevData.Messages).find(
      (entry) => String(entry.id) === partnerId
    );

  if (!chat) return prevData;

  const chatKey =
    prevData.Messages[partnerId] != null
      ? partnerId
      : Object.keys(prevData.Messages).find(
          (key) => String(prevData.Messages[key].id) === partnerId
        );

  if (!chatKey) return prevData;

  const existing = chat.SortedMessages || [];
  if (existing.some((entry) => String(entry._id) === String(message._id))) {
    return prevData;
  }

  return {
    ...prevData,
    Messages: {
      ...prevData.Messages,
      [chatKey]: {
        ...chat,
        SortedMessages: [message, ...existing],
      },
    },
  };
}

const Chat = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const myId = user?.id;
  const [selectedUser, setSelectedUser] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [justSent, setJustSent] = React.useState(null);
  const [currViewMobile, setCurrViewMobile] = React.useState("ChatPreview");

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiFetch("/chat/getChats", {
        method: "POST",
        body: JSON.stringify({ limit: CHAT_MESSAGE_LIMIT }),
      });
      const nextData = await response.json();
      setData(nextData);
      setIsLoaded(true);
    } catch (err) {
      console.log(err);
    }
  }, [isAuthenticated]);

  const handleIncomingMessage = useCallback(
    (message) => {
      setData((prev) => appendMessageToData(prev, message, myId));
      setJustSent(null);
    },
    [myId]
  );

  const handleOutgoingMessage = useCallback(
    (message) => {
      setData((prev) => appendMessageToData(prev, message, myId));
      setJustSent(null);
    },
    [myId]
  );

  const handleOlderMessagesLoaded = useCallback((partnerId, olderMessages, hasMore) => {
    setData((prev) =>
      prependOlderMessagesToData(prev, partnerId, olderMessages, hasMore)
    );
  }, []);

  const handleMatchCreated = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const socketHandlersRef = useRef({
    handleIncomingMessage,
    handleMatchCreated,
  });

  socketHandlersRef.current = {
    handleIncomingMessage,
    handleMatchCreated,
  };

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      window.location = "/";
      return;
    }
    fetchData();
  }, [loading, isAuthenticated, fetchData]);

  useEffect(() => {
    if (!isAuthenticated) return;

    ensureChatSocketConnected();
    setChatSocketHandlers({
      onNewMessage: (message) =>
        socketHandlersRef.current.handleIncomingMessage(message),
      onMatchCreated: () => socketHandlersRef.current.handleMatchCreated(),
    });

    return () => destroyChatSocket();
  }, [isAuthenticated]);

  return (
    <div class="Chat gradient-background2">
    <Grid container className="Chat Chatdiv">
      {!isLoaded && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            textAlign: "center",
            width: "100%",
            height: "100%",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "block" }}>
            <CircularProgress
              size="10rem"
              style={{ color: "white", marginBottom: "2rem" }}
              sx={{
                "--CircularProgress-thickness": "24px",
              }}
            />
            <h1>Gathering Chats...</h1>
          </div>
        </motion.div>
      )}

      {isLoaded && isAuthenticated && (
        <>
          <Grid size={4} className={`ChatListGrid ${currViewMobile === "ChatPreview" ? 'currViewMobile' : 'notCurrViewMobile'}`} sx={{ border: 1 }} spacing={2}>
            <Box className="ChatList">
              {Object.entries(data["Messages"]).map(([key]) => (
                <ChatPreview
                  key={key}
                  userId={key}
                  user={data["Messages"][key]}
                  justSent={justSent}
                  selectedUser={data["Messages"][selectedUser]}
                  setSelectedUser={setSelectedUser}
                  setCurrViewMobile={setCurrViewMobile}
                />
              ))}
            </Box>
          </Grid>
          <Grid size={8} className={`ChatRoomGrid ${currViewMobile === "ChatRoomGrid" ? 'currViewMobile' : 'notCurrViewMobile'}`} sx={{ height: "100%" }}>
            <Box className="ChatRoom">
              {selectedUser && (
                <>
                  <ArrowBackIosNewIcon
                    onClick={() => setCurrViewMobile("ChatPreview")}
                    id={`chatBackIcon`}
                    fontSize="large" />
                  <ChatRoom
                    user={data["Messages"][selectedUser]}
                    justSent={justSent}
                    setJustSent={setJustSent}
                    onMessageSent={handleOutgoingMessage}
                    onOlderMessagesLoaded={handleOlderMessagesLoaded}
                    messageLimit={CHAT_MESSAGE_LIMIT} />
                </>
              )}
              {!selectedUser && Object.keys(data["Messages"]).length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  Select a chat
                </Box>
              )}
              {!selectedUser && Object.keys(data["Messages"]).length === 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <p>No chats yet, try matching with someone first!</p>
                </Box>
              )}
            </Box>
          </Grid>
        </>
      )}
      {!loading && !isAuthenticated && <div className="centeredDiv"><p>Session expired, please log back in.</p></div>}
    </Grid>
    </div>
  );
};

export default Chat;
