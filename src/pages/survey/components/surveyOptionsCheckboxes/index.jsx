import * as React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import "./styles.css";

const SurveyOptionsCheckboxes = ({
  question,
  currSelectedElement,
  setCurrSelectedElement,
  currSelectedAnswer,
  setCurrSelectedAnswer,
}) => {
  const selectedValues = Array.isArray(currSelectedAnswer) ? currSelectedAnswer : [];

  const selected = (e) => {
    console.log("before: ", selectedValues);
    if (e.target.checked === true) {
      setCurrSelectedAnswer([...selectedValues, e.target.value]);
    } else {
      setCurrSelectedAnswer(
        selectedValues.filter((item) => item !== e.target.value)
      );
    }
  };
  return (
    <FormGroup>
      {question.options.map((option) => {
        return (
          <FormControlLabel
            onChange={selected}
            value={option.name}
            key={option.name}
            checked={selectedValues.includes(option.name)}
            name={`optionQ${question.id}`}
            control={<Checkbox />}
            label={option.name}
          />
        );
      })}
      {/* <FormControlLabel
        onChange={selected}
        value="label"
        name={`optionQ${question.id}`}
        control={<Checkbox />}
        label="Label"
      />
      <FormControlLabel
        onChange={selected}
        value="required"
        name={`optionQ${question.id}`}
        required
        control={<Checkbox />}
        label="Required"
      />
      <FormControlLabel
        onChange={selected}
        value="disabled"
        name={`optionQ${question.id}`}
        control={<Checkbox />}
        label="Disabled"
      /> */}
    </FormGroup>
  );
};

export default SurveyOptionsCheckboxes;
