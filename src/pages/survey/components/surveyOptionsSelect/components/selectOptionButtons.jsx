import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

export default function SelectOptionButtons({
  option,
  currSelectedAnswer,
  setCurrSelectedAnswer
}) {
  const removeOptionFromSelectedAnswer = (e) => {
    
    let currSelectedAnswerTemp = [...currSelectedAnswer];
    currSelectedAnswerTemp = currSelectedAnswerTemp.filter(
      (item) => item !== e.target.value
    );
    setCurrSelectedAnswer(currSelectedAnswerTemp);
    console.log(currSelectedAnswerTemp, e.target)
  };

  const buttons = [
    <Button key={`${option}`}>{`${option}`}</Button>,
    <Button key={`${option}`} value={`${option}`} onClick={removeOptionFromSelectedAnswer}>
      x
    </Button>,
  ];
  return (
    <ButtonGroup color="primary" aria-label="Medium-sized button group" sx={{m: 0.5}}>
      {buttons}
    </ButtonGroup>
  );
}
