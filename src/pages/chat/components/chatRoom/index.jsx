import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import React, { useRef } from "react";
import "./styles.css";
import MuiDivider from "@mui/material/Divider";
import styled from "@mui/material/styles/styled";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import InputAdornment from "@mui/material/InputAdornment";
import Cookies from "js-cookie";
import { apiFetch } from "../../../../utils/apiFetch";
import Settings from "./components/settings";
import Tooltip from "@mui/material/Tooltip";

const Divider = styled(MuiDivider)(({ theme }) => ({
  marginTop: "1rem",
  width: "100%",
  borderRadius: 2,
  border: "0.2px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
}));

const ChatRoom = ({ user, justSent, setJustSent }) => {
  const [currMessage, setCurrMessage] = React.useState("");
  const currDate = useRef(null);
  let index = -1;
  const regExp = /[a-zA-Z]/g;

  /**** Util functions -- mainly pertaining to date *****/

  const today = new Date();

  function isTodayOrYesterday(date) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if the date is today
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }

    // Check if the date is yesterday
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
    const day = date.getDate().toString().padStart(2, "0"); // add leading zero if needed
    const year = date.getFullYear();

    const formattedDate = `${fullMonth} ${day}${today.getFullYear() !== year ? `, ${year}` : ""
      }`;
    return formattedDate;
  }

  function getFormattedTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // 0 should be displayed as 12

    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  function isOverAnHourApart(date1, date2) {
    // Get the difference in milliseconds
    const diff = Math.abs(date1.getTime() - date2.getTime());

    // Convert milliseconds to hours
    const hoursDiff = diff / (1000 * 60 * 60);

    // Check if the difference is greater than 1 hour
    return hoursDiff > 1;
  }

  /*********************************************************/

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
    // first figure out if enough time has passed to add date
    let dateIfOverHourApart = null;

    if (!currDate.current) {
      currDate.current = date;
    }
    console.log(
      message,
      date,
      outgoingOrIncoming,
      currDate.current,
      isOverAnHourApart(new Date(currDate.current), date),
      isLastItem
    );
    if (
      currDate.current &&
      (isOverAnHourApart(new Date(currDate.current), date) || isLastItem)
    ) {
      if (isLastItem || previousMessageDate === undefined) {
        dateIfOverHourApart = date;
      } else {
        dateIfOverHourApart = previousMessageDate;
        console.log(
          "previousMessageDATE CHOSEN: ",
          message,
          previousMessage,
          previousMessageDate
        );
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

      // then create and return message box

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
          <Box className={`message ${outgoingOrIncoming} ${regExp.test(message) ? '' : 'isEmpty'}`}>
            <p>{message}</p>
          </Box>
        </Tooltip>
        {isLastItem && dateObj}
      </>
    );
  }

  function sendMessage() {
    const today = new Date();
    apiFetch("/chat/sendMessage", {
      method: "POST",
      body: JSON.stringify({
        to: user.id,
        message: currMessage,
        date: today,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setJustSent(currMessage);
        setCurrMessage("");
      })
      .catch((err) => {
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

      <Box className="messages">
        {Object.entries(user.SortedMessages).map(([key, value]) => {
          let date = new Date(user.SortedMessages[key]["date"]);
          const isLastItem =
            Object.keys(user.SortedMessages)[
              Object.keys(user.SortedMessages).length - 1
            ] === key
              ? true
              : false;

          const isFirstItem =
            Object.keys(user.SortedMessages)[0] === key ? true : false;

          if (isFirstItem) {
            currDate.current = date;
          }

          const previousMessage = user.SortedMessages[index];
          const previousMessageDate = new Date(previousMessage?.date);
          index += 1;
          return createAndAddMessage(
            value.message,
            Cookies.get("id") === user.SortedMessages[key]["from"]
              ? "outgoing"
              : "incoming",
            date,
            isLastItem,
            previousMessage?.message,
            previousMessageDate
          );
        })}
        {justSent &&
          (Object.entries(user.SortedMessages).length === 0
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

        {/* <Box className="date">
          <p>Today 1:26pm</p>
        </Box>
        <Box className="message incoming first">
          <p>hey</p>
        </Box>
        <Box className="message incoming">
          <p>whats up?</p>
        </Box>

        <Box className="date">
          <p>Today 8:43pm</p>
        </Box>

        <Box className="message outgoing">
          <p>
            heyyy nothing much! I saw your profile and you seem like you'd have
            a lot in common with me, I was wondering if you found a roommate
            yet?
          </p>
        </Box>
        <Box className="message outgoing">
          <p>
            there's an open house for an apartment in el segundo if youre down
            to go!
          </p>
        </Box>

        <Box className="message incoming">
          <p>
            aww wait yeah that sounds so fun! where are you at rn? wanna
            carpool?
          </p>
        </Box>

        <Box className="date">
          <p>Today 1:26pm</p>
        </Box>
        <Box className="message incoming">
          <p>hii did you still wanna carpool</p>
        </Box>
        <Box className="message incoming">
          <p>
            just lmk whenever you have time, lorem ipsum blah blah placeholder
            text lorem ipsum blah blah placeholder text lorem ipsum blah blah
            placeholder text lorem ipsum blah blah placeholder text
          </p>
        </Box> */}

        {/* Message input box at bottom */}
        <Box className="messageInputBox">
          <TextField
            className="messageInput"
            id="outlined-basic"
            label="Message"
            value={currMessage}
            variant="outlined"
            onChange={handleInput}
            sx={{
              // Root class for the input field
              "& .MuiOutlinedInput-root": {
                color: "#abb5c4",
                fontFamily: "Arial",
                fontWeight: "bold",
                backgroundColor: "#111a21",
                borderRadius: "1rem",
                // Class for the border around the input field
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#485261",
                  borderWidth: "1px",
                },
              },
              // Class for the label of the input field
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
    </Box>
  );
};

export default ChatRoom;