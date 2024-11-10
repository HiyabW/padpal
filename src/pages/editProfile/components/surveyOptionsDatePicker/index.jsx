import React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from 'dayjs';

import "./styles.css";

const today = new Date();
const eighteenYearsAgo = new Date(today);

eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
const eighteenYearsAgoFormatted = new Intl.DateTimeFormat('en-US', { 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit' 
}).format(eighteenYearsAgo);


const SurveyOptionsDatePicker = ({
  expectedMoveOut,
  setExpectedMoveOut
}) => {
  const selected = (e) => {
    let formattedSelectedDate = new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(e["$d"]);
    setExpectedMoveOut(formattedSelectedDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} sx={{width:'100%'}}>
      <DemoContainer components={["DatePicker"]}>
        <DatePicker
          disableFuture={false}
          disablePast={true}
          onChange={selected}
          label="Select a date"
          value={dayjs(expectedMoveOut)}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default SurveyOptionsDatePicker;
