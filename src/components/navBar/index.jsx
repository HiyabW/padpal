import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import React from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import "./styles.css";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";

function redirectToFeed() {
  window.location = "/feed";
}

function redirectToViewProfile() {
  window.location = `/viewProfile?id=${Cookies.get("id")}`;
}

function redirectToChat() {
  window.location = "/chat";
}

function logout() {
  Cookies.remove("id");
  Cookies.remove("isLoggedIn");
  window.location = "/";
}

const NavBar = () => {
  const location = useLocation();
  console.log(location);
  const chatOrFeedButton = location.pathname === "/chat" ? "feed" : "chat";

  return (
    <Box className="navBar">
      <h1 onClick={redirectToFeed}>
        <i>PadPal</i>
      </h1>
      <Box className="navBarOptions">
        {chatOrFeedButton === "chat" && (
          <Box display={"flex"} marginLeft={"1rem"} onClick={redirectToChat}>
            <Tooltip title="Chat">
              <ChatBubbleIcon sx={{ marginTop: "0.1rem" }} />
            </Tooltip>
          </Box>
        )}

        {chatOrFeedButton !== "chat" && (
          <Box display={"flex"} marginLeft={"1rem"} onClick={redirectToFeed}>
            <Tooltip title="Feed">
              <GroupsIcon />
            </Tooltip>
          </Box>
        )}

        {/* <Box
          display={"flex"}
          marginLeft={"2rem"}
          onClick={redirectToEditProfile}
        >
          <Tooltip title="Edit Profile">
            <EditIcon />
          </Tooltip>
        </Box> */}

        <Box
          display={"flex"}
          marginLeft={"2rem"}
          onClick={redirectToViewProfile}
        >
          <Tooltip title="View Profile">
            <PersonIcon />
          </Tooltip>
        </Box>

        <Box display={"flex"} marginLeft={"2rem"} onClick={logout}>
          <Tooltip title="Logout">
            <LogoutIcon />
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default NavBar;
