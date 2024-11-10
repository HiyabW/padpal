import * as React from "react";
import "./styles.css";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

function valuetext(value) {
  return `${value}°C`;
}

const minDistance = 1;

const SurveyOptionsSlider = ({
  currSelectedAnswer,
  defaultMax,
  defaultMin,
  defaultRange
}) => {
  // Util functions for slider
  const [value, setValue] = React.useState([defaultMin, defaultMax]);

  const handleChange = (e, newValue, activeThumb) => {

    // ... then update slider itself
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
      currSelectedAnswer.current = [{
        min: Math.min(newValue[0], value[1] - minDistance),
        max: value[1],
      }];
    } else {
      setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
      currSelectedAnswer.current = [{
        min: value[0],
        max: Math.max(newValue[1], value[0] + minDistance),
      }];
    }
    console.log(currSelectedAnswer);
  };

  return (
    <div style={{width:'100%'}}>
      <Box sx={{ width: '75%'}}>
        <Slider
          getAriaLabel={() => "Minimum distance shift"}
          value={value}
          min={defaultRange[0]}
          max={defaultRange[1]}
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
