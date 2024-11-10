import React from "react";
import Button from "@mui/material/Button";
import "./styles.css";

const SurveyOptionsButtons = ({
  question,
  currSelectedElement,
  setCurrSelectedElement,
  currSelectedAnswer,
  setCurrSelectedAnswer,
}) => {
  const selected = (e) => {
    if (currSelectedElement) {
      currSelectedElement.classList.remove("selected");
    }
    e.target.classList.add("selected");
    setCurrSelectedElement(e.target);
    console.log(currSelectedAnswer);
    setCurrSelectedAnswer(e.target.value);
  };
  return (
    <ul className="buttonList">
      {question.options.map((option) => {
        return (
          <li className="buttonListItem">
            <Button
            className="buttonListElement"
            variant="outlined"
              onClick={(e) => {
                selected(e);
              }}
              value={option.name}
            >
              {option.name}
            </Button>
          </li>
        );
      })}
      {/* <Button
        onClick={(e) => {
          selected(e);
        }}
        value="option1"
      >
        option1
      </Button>
      <Button
        onClick={(e) => {
          selected(e);
        }}
        value="option2"
      >
        option2
      </Button> */}
    </ul>
  );
};

export default SurveyOptionsButtons;
