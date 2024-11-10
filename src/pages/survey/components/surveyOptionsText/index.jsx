import React from "react";
import "./styles.css";
import TextField from "@mui/material/TextField";

const SurveyOptionsText = ({
  question,
  currSelectedElement,
  setCurrSelectedElement,
  currSelectedAnswer,
  setCurrSelectedAnswer,
}) => {
  const updateAnswer = (e) => {
    if (currSelectedElement) {
      currSelectedElement.classList.remove("selected");
    }
    e.target.classList.add("selected");
    setCurrSelectedElement(e.target);
    console.log(currSelectedAnswer);
    setCurrSelectedAnswer(e.target.value);
  };

  return (
    <div>
      <TextField
        sx={{width:'70%'}}
        multiline
        onChange={updateAnswer}
        id="outlined-basic"
        label={question.placeholder}
        variant="standard"
        className="textFieldSurvey"
      />
    </div>
  );
};

export default SurveyOptionsText;
