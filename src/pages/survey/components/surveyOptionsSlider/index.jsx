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
  const savedRange =
    Array.isArray(currSelectedAnswer) &&
    currSelectedAnswer[0]?.min != null &&
    currSelectedAnswer[0]?.max != null
      ? currSelectedAnswer[0]
      : null;

  const value = savedRange
    ? [savedRange.min, savedRange.max]
    : [question.min, question.max];

  const handleChange = (e, newValue, activeThumb) => {
    setCurrSelectedElement(e.target);

    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      const nextMin = Math.min(newValue[0], value[1] - minDistance);
      setCurrSelectedAnswer([{ min: nextMin, max: value[1] }]);
    } else {
      const nextMax = Math.max(newValue[1], value[0] + minDistance);
      setCurrSelectedAnswer([{ min: value[0], max: nextMax }]);
    }
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
