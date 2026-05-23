import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import "./styles.css";
import MuiDivider from "@mui/material/Divider";
import styled from "@mui/material/styles/styled";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import InputAdornment from "@mui/material/InputAdornment";
import Cookies from "js-cookie";
import { apiFetch } from "../../../../api/client";
import Settings from "./components/settings";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

const SCROLL_LOAD_THRESHOLD_PX = 80;

const Divider = styled(MuiDivider)(({ theme }) => ({
  marginTop: "1rem",
  width: "100%",
  borderRadius: 2,
  border: "0.2px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
}));

const ChatRoom = ({
  user,
  justSent,
  setJustSent,
  onMessageSent,
  onOlderMessagesLoaded,
  messageLimit = 25,
}) => {
  const [currMessage, setCurrMessage] = React.useState("");
  const [isLoadingOlder, setIsLoadingOlder] = React.useState(false);
  const currDate = useRef(null);
  const messagesRef = useRef(null);
  const scrollRestoreRef = useRef(null);
  const loadingOlderRef = useRef(false);
  const needsInitialScrollRef = useRef(true);
  const previousUserIdRef = useRef(null);
  const regExp = /[a-zA-Z]/g;
  const sortedMessages = Array.isArray(user.SortedMessages)
    ? user.SortedMessages
    : Object.values(user.SortedMessages || {});
  const displayMessages = [...sortedMessages].reverse();
  const hasMore = user.hasMore !== false;

  /**** Util functions -- mainly pertaining to date *****/

  const today = new Date();

  function isTodayOrYesterday(date) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }

    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }

    return "Neither";
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function getDay(date) {
    const fullMonth = monthNames[date.getMonth()];
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    const formattedDate = `${fullMonth} ${day}${
      today.getFullYear() !== year ? `, ${year}` : ""
    }`;
    return formattedDate;
  }

  function getFormattedTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  function isOverAnHourApart(date1, date2) {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    const hoursDiff = diff / (1000 * 60 * 60);
    return hoursDiff > 1;
  }

  /*********************************************************/

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlderRef.current || !hasMore || sortedMessages.length === 0) {
      return;
    }

    const oldestMessage = sortedMessages[sortedMessages.length - 1];
    if (!oldestMessage?.date) return;

    const container = messagesRef.current;
    if (!container) return;

    scrollRestoreRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };

    loadingOlderRef.current = true;
    setIsLoadingOlder(true);

    try {
      const response = await apiFetch("/chat/getMessages", {
        method: "POST",
        body: JSON.stringify({
          partnerId: String(user.id),
          before: oldestMessage.date,
          limit: messageLimit,
        }),
      });
      const { messages, hasMore: nextHasMore } = await response.json();

      if (messages?.length) {
        onOlderMessagesLoaded?.(user.id, messages, nextHasMore);
      } else {
        scrollRestoreRef.current = null;
        onOlderMessagesLoaded?.(user.id, [], false);
      }
    } catch (err) {
      scrollRestoreRef.current = null;
      console.log(err);
    } finally {
      loadingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [
    hasMore,
    messageLimit,
    onOlderMessagesLoaded,
    sortedMessages,
    user.id,
  ]);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesRef.current;
    if (
      !container ||
      loadingOlderRef.current ||
      !hasMore ||
      needsInitialScrollRef.current
    ) {
      return;
    }

    if (container.scrollTop <= SCROLL_LOAD_THRESHOLD_PX) {
      loadOlderMessages();
    }
  }, [hasMore, loadOlderMessages]);

  useLayoutEffect(() => {
    const isNewChat = previousUserIdRef.current !== user.id;
    if (isNewChat) {
      previousUserIdRef.current = user.id;
      currDate.current = null;
      scrollRestoreRef.current = null;
      loadingOlderRef.current = false;
      setIsLoadingOlder(false);
      needsInitialScrollRef.current = true;
    }

    const container = messagesRef.current;
    if (!container || displayMessages.length === 0) return;

    if (scrollRestoreRef.current) {
      const { scrollHeight, scrollTop } = scrollRestoreRef.current;
      container.scrollTop =
        container.scrollHeight - scrollHeight + scrollTop;
      scrollRestoreRef.current = null;
      return;
    }

    if (needsInitialScrollRef.current) {
      container.scrollTop = container.scrollHeight;
      needsInitialScrollRef.current = false;
    }
  }, [user.id, displayMessages.length]);

  function handleInput(e) {
    setCurrMessage(e.target.value);
  }

  function createAndAddMessage(
    message,
    outgoingOrIncoming,
    date,
    isLastItem = false,
    previousMessage,
    previousMessageDate
  ) {
    let dateIfOverHourApart = null;

    if (!currDate.current) {
      currDate.current = date;
    }

    if (
      currDate.current &&
      (isOverAnHourApart(new Date(currDate.current), date) || isLastItem)
    ) {
      if (isLastItem || previousMessageDate === undefined) {
        dateIfOverHourApart = date;
      } else {
        dateIfOverHourApart = previousMessageDate;
      }

      currDate.current = date;
    }
    let dateObj = null;
    if (dateIfOverHourApart) {
      let dateTime = null;
      let dateDay = isTodayOrYesterday(dateIfOverHourApart);
      if (dateDay === "Neither") {
        dateDay = getDay(dateIfOverHourApart);
      }
      dateTime = getFormattedTime(dateIfOverHourApart);

      dateObj = (
        <Box className="date">
          <p>
            {dateDay} {dateTime}
          </p>
        </Box>
      );
    }

    return (
      <>
        {!isLastItem && dateObj}
        <Tooltip
          title={date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
          placement={
            outgoingOrIncoming === "outgoing" ? "right-start" : "left-start"
          }
        >
          <Box
            className={`message ${outgoingOrIncoming} ${
              regExp.test(message) ? "" : "isEmpty"
            }`}
          >
            <p>{message}</p>
          </Box>
        </Tooltip>
        {isLastItem && dateObj}
      </>
    );
  }

  function sendMessage() {
    if (!currMessage.trim()) return;

    const text = currMessage;
    const today = new Date();
    setJustSent(text);
    setCurrMessage("");

    apiFetch("/chat/sendMessage", {
      method: "POST",
      body: JSON.stringify({
        to: user.id,
        message: text,
        date: today,
      }),
    })
      .then((response) => response.json())
      .then((savedMessage) => {
        onMessageSent?.(savedMessage);
      })
      .catch((err) => {
        setJustSent(null);
        setCurrMessage(text);
        console.log(err);
      });
  }

  return (
    <Box className="ChatRoomDiv">
      <Box className="ChatRoomHeader">
        <Box
          display={"flex"}
          sx={{ justifyContent: "center", alignItems: "center" }}
        >
          <img src={user.Pfp} />
          <br></br>
          <h1>{user.name}</h1>
        </Box>

        <Settings user={user} />
      </Box>
      <Divider></Divider>

      <Box className="messagesViewport">
        {isLoadingOlder && (
          <Box className="loadOlderMessages" aria-live="polite">
            <CircularProgress size="1.5rem" sx={{ color: "white" }} />
          </Box>
        )}

        <Box
          className="messages"
          ref={messagesRef}
          onScroll={handleMessagesScroll}
        >
          {hasMore && (
            <div className="olderMessagesSentinel" aria-hidden="true" />
          )}

          {displayMessages.map((value, messageIndex) => {
            let date = new Date(value.date);
            const isLastItem = messageIndex === displayMessages.length - 1;
            const isFirstItem = messageIndex === 0;

            if (isFirstItem) {
              currDate.current = date;
            }

            const previousMessage = displayMessages[messageIndex - 1];
            const previousMessageDate = new Date(previousMessage?.date);
            return (
              <React.Fragment key={value._id || messageIndex}>
                {createAndAddMessage(
                  value.message,
                  Cookies.get("id") === value.from ? "outgoing" : "incoming",
                  date,
                  isLastItem,
                  previousMessage?.message,
                  previousMessageDate
                )}
              </React.Fragment>
            );
          })}
          {justSent &&
            (displayMessages.length === 0
              ? true
              : isOverAnHourApart(currDate.current, new Date())) && (
              <Box className="date">
                <p>Today {getFormattedTime(new Date())}</p>
              </Box>
            )}
          {justSent && (
            <Box
              className={`outgoing`}
              sx={{
                backgroundColor: "#485869",
                marginBottom: "0.8rem",
                borderRadius: "1rem",
                paddingTop: "0.7rem",
                width: "fit-content",
                maxWidth: "70%",
                paddingLeft: "1.2rem",
                paddingRight: "1.2rem",
              }}
            >
              <p>{justSent}</p>
            </Box>
          )}
        </Box>
      </Box>

      <Box className="messageInputBox">
        <TextField
          className="messageInput"
          id="outlined-basic"
          label="Message"
          value={currMessage}
          variant="outlined"
          onChange={handleInput}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#abb5c4",
              fontFamily: "Arial",
              fontWeight: "bold",
              backgroundColor: "#111a21",
              borderRadius: "1rem",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#485261",
                borderWidth: "1px",
              },
            },
            "& .MuiInputLabel-outlined": {
              color: "#abb5c4",
              fontWeight: "bold",
            },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={sendMessage}
                    sx={{ zIndex: 5, backgroundColor: "#1967b4" }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatRoom;
