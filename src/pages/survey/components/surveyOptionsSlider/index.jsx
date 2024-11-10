import * as React from "react";
import "./styles.css";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

function valuetext(value) {
  return `${value}°C`;
}

const minDistance = 1;

const SurveyOptionsSlider = ({
  question,
  currSelectedElement,
  setCurrSelectedElement,
  currSelectedAnswer,
  setCurrSelectedAnswer,
}) => {
  // Util functions for slider
  const [value, setValue] = React.useState([question.min, question.max]);

  const handleChange = (e, newValue, activeThumb) => {
    // First update min value...
    setCurrSelectedElement(e.target);

    // ... then update slider itself
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
      setCurrSelectedAnswer([{
        min: Math.min(newValue[0], value[1] - minDistance),
        max: value[1],
      }]);
    } else {
      setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
      setCurrSelectedAnswer([{
        min: value[0],
        max: Math.max(newValue[1], value[0] + minDistance),
      }]);
    }
    console.log(currSelectedAnswer);
  };

  return (
    <div>
      <Box sx={{ width: 300 }}>
        <Slider
          getAriaLabel={() => "Minimum distance shift"}
          value={value}
          min={question.min}
          max={question.max}
          onChange={handleChange}
          valueLabelDisplay="auto"
          getAriaValueText={valuetext}
          disableSwap
        />
      </Box>
    </div>
  );
};

export default SurveyOptionsSlider;
