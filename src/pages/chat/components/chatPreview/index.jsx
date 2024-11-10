import Box from "@mui/material/Box";
import React from "react";
import Stack from "react-bootstrap/Stack";
import "./styles.css";
import Grid from "@mui/material/Grid2";

const ChatPreview = ({userId, user, selectedUser, justSent, setSelectedUser}) => {
  const handleClick = () => {
    setSelectedUser(user.id)
  }
  return (
    <Box className="ChatPreview" onClick={handleClick}>
      <Stack direction="column">
        <Grid container spacing={1}>
          <Grid size={2.5}>
            <img src={user?.Pfp} />
          </Grid>
          <Grid size={9.5}>
            <Stack direction="column">
                <Box className="userNameAndDate">
                    <h1>{user?.name}</h1>
                </Box>
                <Box className="recentMessageBox">
                    <p>{(justSent && selectedUser.id===user.id) ? justSent : user?.SortedMessages?.length > 0 ? user?.SortedMessages[0].message : <b><i>Start new chat!</i></b>}</p>
                </Box>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default ChatPreview;