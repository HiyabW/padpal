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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent new line creation
    }
  };

    return (
      <div>
        <TextField
          sx={{ width: '70%' }}
          multiline
          onChange={updateAnswer}
          id="outlined-basic"
          label={question.placeholder}
          variant="standard"
          className="textFieldSurvey"
          inputProps={{
            maxLength: 176, // Maximum number of characters
          }}
          onKeyDown={handleKeyDown} // Attach event handler

        />
      </div>
    );
  };

  export default SurveyOptionsText;
