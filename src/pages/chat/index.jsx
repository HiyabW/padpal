import "./styles.css";
import React, { useEffect } from "react";
import ChatPreview from "./components/chatPreview";
import ChatRoom from "./components/chatRoom";
import Cookies from "js-cookie";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";

const Chat = () => {
  const isLoggedIn = Cookies.get("isLoggedIn");
  const [selectedUser, setSelectedUser] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [justSent, setJustSent] = React.useState(null);
  const [apiKey, setApiKey] = React.useState(null);

  const fetchData = async () => {
    try {
      fetch("https://palpal-api.onrender.com/chat/getChats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: `${Cookies.get("id")}`,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setData(data);
          setIsLoaded(true);
          setJustSent(null);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 3000); // Fetch every 5 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <Grid container className="Chat gradient-background2">
      {!isLoaded && isLoggedIn && (
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

      {isLoaded && isLoggedIn && (
        <>
          <Grid size={4} className="ChatListGrid" sx={{ border: 1 }} spacing={2}>
            <Box className="ChatList">
              {Object.entries(data["Messages"]).map(([key]) => (
                <ChatPreview
                  userId={key}
                  user={data["Messages"][key]}
                  justSent={justSent}
                  selectedUser={data["Messages"][selectedUser]}
                  setSelectedUser={setSelectedUser}
                />
              ))}
            </Box>
          </Grid>
          <Grid size={8} className="ChatRoomGrid" sx={{ height: "100%" }}>
            <Box className="ChatRoom">
              {selectedUser && (
                <ChatRoom
                  user={data["Messages"][selectedUser]}
                  justSent={justSent}
                  setJustSent={setJustSent}
                />
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
      {!isLoggedIn && <div className="centeredDiv"><p>Session expired, please log back in.</p></div>}
    </Grid>
  );
};

export default Chat;