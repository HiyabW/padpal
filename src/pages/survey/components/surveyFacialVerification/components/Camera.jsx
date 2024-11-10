import React, { useRef } from "react";
import Webcam from "react-webcam";
import Button from "@mui/material/Button";

const Camera = ({url, setUrl}) => {
  const webcamRef = useRef(null);

  const capturePhoto = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setUrl(imageSrc);
  }, [webcamRef]);

  return (
    <>
      {url && (
        <div>
          <img src={url} alt="Screenshot" />
        </div>
      )}
      {!url && (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/png"
          mirrored={true}
        />
      )}
      <br></br>

      <Button variant="contained" disableElevation onClick={capturePhoto} sx={{marginRight: '0.5rem'}}>
        Capture
      </Button>
      <Button variant="outlined" onClick={() => setUrl(null)}>
        Refresh
      </Button>
    </>
  );
};

export default Camera;
