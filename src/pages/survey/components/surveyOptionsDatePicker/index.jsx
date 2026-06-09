import React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import dayjs from "dayjs";

import "./styles.css";

const today = new Date();
const eighteenYearsAgo = new Date(today);

eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
const eighteenYearsAgoFormatted = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(eighteenYearsAgo);

const SurveyOptionsDatePicker = ({
  question,
  currSelectedElement,
  setCurrSelectedElement,
  currSelectedAnswer,
  setCurrSelectedAnswer,
}) => {
  const selected = (e) => {
    setCurrSelectedElement(e);
    try {
      setCurrSelectedAnswer(e["$d"]);
    }
    catch (e) {
      setCurrSelectedAnswer(null);
    }
    console.log(currSelectedAnswer);
  };

  let maxDate =
    question.label === "age" ? dayjs(eighteenYearsAgoFormatted) : undefined;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["MobileDatePicker"]}>
        <MobileDatePicker
          disableFuture={question.label === "age" ? true : false}
          disablePast={question.label === "age" ? false : true}
          maxDate={maxDate}
          onChange={selected}
          label="Select a date"
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default SurveyOptionsDatePicker;
