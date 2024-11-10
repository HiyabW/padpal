import * as React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import "./styles.css";

const SurveyOptionsCheckboxes = ({
  currSelectedAnswer,
  setCurrSelectedAnswer,
  options,
}) => {
  const selected = (e) => {
    console.log("before: ", currSelectedAnswer);
    if (e.target.checked === true) {
      setCurrSelectedAnswer([...currSelectedAnswer, e.target.value]);
    } else {
      let currSelectedAnswerTemp = [...currSelectedAnswer];
      currSelectedAnswerTemp = currSelectedAnswerTemp.filter(
        (item) => item !== e.target.value
      );
      setCurrSelectedAnswer(currSelectedAnswerTemp);
    }
  };

  console.log("rerender?");
  return (
    <FormGroup >
      {options.map((option) => {
        const isChecked = currSelectedAnswer.includes(option.name)
          ? true
          : false;

        return (
          <FormControlLabel
            onChange={selected}
            value={option.name}
            key={option.name}
            name={`optionQ${option.id}`}
            control={<Checkbox />}
            label={option.name}
            checked={isChecked}
          />
        );
      })}
    </FormGroup>
  );
};

export default SurveyOptionsCheckboxes;
