import * as React from "react";
import TextField from "@mui/material/TextField";
import "./styles.css";
import Autocomplete from "@mui/material/Autocomplete";
import cities from "./cities";
import hobbies from "./hobbies";
import Box from "@mui/material/Box";
import SelectOptionButtons from "./components/selectOptionButtons";

const SurveyOptionsSelect = ({
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
    // dont change currSelectedAnswer if all they did was hit the X to clear the autoselect text input
    if (e.target.innerHTML.includes("<path") || e.target.innerHTML==="") {
      return;
    }

    // dont add duplicate options
    if (currSelectedAnswer.includes(e.target.innerText)) {
      return;
    }
    e.target.classList.add("selected");
    setCurrSelectedElement(e.target);
    console.log(currSelectedAnswer);
    console.log(e);
    setCurrSelectedAnswer([...currSelectedAnswer, e.target.innerText]);
  };

  const input = question.label === "hobbies" ? hobbies : cities;

  return (
    <Box>
      <Autocomplete
        onChange={updateAnswer}
        disablePortal
        disabled={currSelectedAnswer.length===4}
        options={input}
        sx={{ width: 300 }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box
              key={key}
              component="li"
              sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              {...optionProps}
            >
              {option.iconHex && `${option.iconHex}  `} {option.label}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label={question.label} />
        )}
      />

      <Box id="selectedOptions" direction={"row"} sx={{ my: 2, overflow: 'scroll' }}>
        {console.log(currSelectedAnswer)}
        {currSelectedAnswer.map((option) => {
          return (
            <SelectOptionButtons
              key={option}
              option={option}
              currSelectedAnswer={currSelectedAnswer}
              setCurrSelectedAnswer={setCurrSelectedAnswer}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default SurveyOptionsSelect;
