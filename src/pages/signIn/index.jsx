import React, { useState } from "react";
import "./styles.css"; // Import your CSS file for the fade effect
import Cookies from "js-cookie";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MuiCard from "@mui/material/Card";
import styled from "@mui/material/styles/styled";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import LearnMore from "./components/LearnMore";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Alert from "@mui/material/Alert";
import OutlinedInput from "@mui/material/OutlinedInput";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress"

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "4vw",
  marginBottom: "1rem",
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

function SignIn() {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [phone, setPhone] = useState(null);
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [phoneError, setPhoneError] = React.useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = React.useState("");
  const [error, setError] = React.useState(false);
  const [openLearnMore, setOpenLearnMore] = React.useState(false);
  const [isSignIn, setIsSignIn] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false)

  // Before doing anything, if user is logged in already redirect them to feed page
  const isLoggedIn = Cookies.get("isLoggedIn");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const handleLearnMore = () => {
    setOpenLearnMore(true);
  };

  const handleCloseLearnMore = () => {
    setOpenLearnMore(false);
  };

  const toggleIsSignIn = () => {
    setIsSignIn(!isSignIn);
    setEmail(null);
    setPassword(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    signInUser();
  };

  const validateInputs = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      return;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password || password.value < 8) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 8 characters long.");
      return;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (!isSignIn) {
      if (!name) {
        setNameError(true);
        setNameErrorMessage("Please enter a valid name.");
        return;
      } else {
        setPhoneError(false);
        setPhoneErrorMessage("");
      }

      if (!phone || /[a-zA-Z]/.test(phone)) {
        setPhoneError(true);
        setPhoneErrorMessage("Please enter a valid phone number.");
        return;
      } else {
        setPhoneError(false);
        setPhoneErrorMessage("");
      }
    }

    // either sign in or sign up user depending on isSignIn
    isSignIn ? signInUser() : signUpUser();
  };

  function signInUser() {
    setIsLoading(true)
    fetch("https://palpal-api.onrender.com/auth/login", {
      method: "POST", // or 'POST', 'PUT', 'DELETE', etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `${email}`,
        password: `${password}`,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data, data["id"]);
        // IF LOGIN WORKED
        if (data.accessToken) {
          var inOneHour = new Date(new Date().getTime() + 60 * 60 * 1000);
          Cookies.set("isLoggedIn", `${data.accessToken}`, {
            expires: inOneHour,
          });
          Cookies.set("id", `${data["id"]}`, {
            expires: inOneHour,
          });

          data?.gender
            ? (window.location = "/feed")
            : (window.location = "/survey");
        } else {
          console.log(data.error.message);
          setError(data.error.message);
          setIsLoading(false)
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false)
      });
  }

  function signUpUser() {
    setIsLoading(true)
    fetch("https://palpal-api.onrender.com/auth/register", {
      method: "POST", // or 'POST', 'PUT', 'DELETE', etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `${email}`,
        password: `${password}`,
        phone: `${phone}`,
        name: `${name}`,
      }),
    })
      .then((response) => response.json()) // Assuming the API returns JSON data
      .then((data) => {
        console.log(data);
        // IF SIGN UP WORKED
        if (data.accessToken) {
          var inOneHour = new Date(new Date().getTime() + 15 * 60 * 1000);
          Cookies.set("isLoggedIn", `${data.accessToken}`, {
            expires: inOneHour,
          });
          Cookies.set("id", `${data["id"]}`, {
            expires: inOneHour,
          });

          window.location = "/survey";
        } else {
          console.log(data.error.message);
          setError(data.error.message);
          setIsLoading(false)
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoading(false)
      });
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }
  function handleEmailChange(e) {
    setEmail(e.target.value);
  }
  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }
  function handlePhoneChange(e) {
    setPhone(e.target.value);
  }

  if (isLoggedIn) {
    window.location = "/feed";
  } else {
    return (
      <motion.div
        className={`landingAndSignIn gradient-background2 ${isLoading ? 'loadingLandingAndSignIn' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <div className={`signIn`}>
            
          <Grid
            container
            spacing={{lg:10, md:10, sm:5, xs:5}}
            sx={{ height: "100%", alignItems: "center", padding: "10vw", position: "absolute", width: '100%' }}
          >
            <Grid className="PadPalInfoGrid" size={{ xs: 12, md: 7 }}>
              <Typography className="welcome" variant="h1">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
                >
                  <i className="padpalWelcome">PadPal.</i>
                </motion.div>
              </Typography>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: "easeInOut" }}
              >
                <Typography className="welcomeText" variant="h5">
                  Connecting Roommates, Creating Homes <br></br> One Swipe at a
                  Time.
                </Typography>
                <Button
                  variant="contained"
                  className="learnMoreButton"
                  onClick={handleLearnMore}
                >
                  Learn More
                </Button>
                <LearnMore
                  open={openLearnMore}
                  handleClose={handleCloseLearnMore}
                />
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease: "easeInOut" }}
                style={{ justifyItems: 'center' }}
              >
                {isLoading &&

                  <CircularProgress
                    className="text-center"
                    size="10rem"
                    style={{ color: "white", marginBottom: "2rem" }}
                    sx={{
                      "--CircularProgress-thickness": "24px",
                    }}
                  />

                }
                {
                  !isLoading && <Card variant="outlined" className="signInCard">
                    {error && (
                      <div sx={{ width: "50%" }}>
                        <Alert severity="error">{error}</Alert>
                      </div>
                    )}
                    <Box className="cardHeader">
                      <h1 className="signInTitle">
                        {isSignIn ? "Sign In" : "Sign Up"}
                      </h1>
                      <Typography className="signInSubtitle" variant="h5">
                        {isSignIn
                          ? "Please enter your email and password."
                          : "Please fill out the provided form."}
                      </Typography>
                    </Box>
                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      noValidate
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        gap: 2,
                      }}
                    >
                      {!isSignIn && (
                        <>
                          <FormControl className="formElements">
                            <FormLabel htmlFor="name">First Name</FormLabel>
                            <TextField
                              onChange={handleNameChange}
                              error={nameError}
                              helperText={nameErrorMessage}
                              id="name"
                              type="name"
                              name="name"
                              placeholder="John Doe"
                              autoComplete="name"
                              required
                              fullWidth
                              variant="outlined"
                              color={emailError ? "error" : "primary"}
                              sx={{ ariaLabel: "name" }}
                            />
                          </FormControl>
                          <FormControl className="formElements">
                            <FormLabel htmlFor="phone">Phone Number</FormLabel>
                            <TextField
                              onChange={handlePhoneChange}
                              error={phoneError}
                              helperText={phoneErrorMessage}
                              id="phone"
                              type="phone"
                              name="phone"
                              placeholder="6617542995"
                              autoComplete="phone"
                              required
                              fullWidth
                              variant="outlined"
                              color={emailError ? "error" : "primary"}
                              sx={{ ariaLabel: "email" }}
                            />
                          </FormControl>

                          <FormControl className="formElements">
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <TextField
                              onChange={handleEmailChange}
                              error={emailError}
                              helperText={emailErrorMessage}
                              id="email"
                              type="email"
                              name="email"
                              placeholder="your@email.com"
                              autoComplete="email"
                              required
                              fullWidth
                              variant="outlined"
                              color={emailError ? "error" : "primary"}
                              sx={{ ariaLabel: "email" }}
                              value={email}
                            />
                          </FormControl>
                          <FormControl>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <FormLabel htmlFor="password">Password</FormLabel>
                            </Box>
                            <OutlinedInput
                              onChange={handlePasswordChange}
                              error={passwordError}
                              helperText={passwordErrorMessage}
                              name="password"
                              placeholder="password"
                              type={showPassword ? "text" : "password"}
                              endAdornment={
                                <IconButton
                                  aria-label={
                                    showPassword
                                      ? "hide the password"
                                      : "display the password"
                                  }
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  onMouseUp={handleMouseUpPassword}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              }
                              id="password"
                              autoComplete="new-password"
                              required
                              fullWidth
                              variant="outlined"
                              color={passwordError ? "error" : "primary"}
                            />
                          </FormControl>
                          <FormControlLabel
                            control={
                              <Checkbox value="remember" color="primary" />
                            }
                            label="Remember me"
                          />
                        </>
                      )}
                      {/* <ForgotPassword open={open} handleClose={handleClose} /> */}
                      {isSignIn && (
                        <>
                          <FormControl className="formElements">
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <TextField
                              onChange={handleEmailChange}
                              error={emailError}
                              helperText={emailErrorMessage}
                              id="email"
                              type="email"
                              name="email"
                              placeholder="your@email.com"
                              autoComplete="email"
                              required
                              fullWidth
                              variant="outlined"
                              color={emailError ? "error" : "primary"}
                              sx={{ ariaLabel: "email" }}
                              value={email}
                            />
                          </FormControl>
                          <FormControl>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <FormLabel htmlFor="password">Password</FormLabel>
                            </Box>
                            <OutlinedInput
                              onChange={handlePasswordChange}
                              error={passwordError}
                              helperText={passwordErrorMessage}
                              name="password"
                              placeholder="password"
                              type={showPassword ? "text" : "password"}
                              endAdornment={
                                <IconButton
                                  aria-label={
                                    showPassword
                                      ? "hide the password"
                                      : "display the password"
                                  }
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  onMouseUp={handleMouseUpPassword}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              }
                              id="password"
                              autoComplete="current-password"
                              required
                              fullWidth
                              variant="outlined"
                              color={passwordError ? "error" : "primary"}
                            />
                          </FormControl>
                          <FormControlLabel
                            control={
                              <Checkbox value="remember" color="primary" />
                            }
                            label="Remember me"
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={validateInputs}
                          >
                            Sign in
                          </Button>
                          <Typography sx={{ textAlign: "center" }}>
                            Don&apos;t have an account?{" "}
                            <span>
                              <Link
                                onClick={toggleIsSignIn}
                                variant="body2"
                                sx={{ alignSelf: "center" }}
                              >
                                Sign up
                              </Link>
                            </span>
                          </Typography>
                        </>
                      )}
                      {!isSignIn && (
                        <>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={validateInputs}
                          >
                            Sign up
                          </Button>
                          <Typography sx={{ textAlign: "center" }}>
                            Already have an account?{" "}
                            <span>
                              <Link
                                onClick={toggleIsSignIn}
                                variant="body2"
                                sx={{ alignSelf: "center" }}
                              >
                                Sign in
                              </Link>
                            </span>
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Card>
                }
              </motion.div>
            </Grid>
          </Grid>
          {/* <TextField
            onChange={handleEmailChange}
            id="outlined-basic"
            label="Username"
            variant="outlined"
          />
          <TextField
            onChange={handlePasswordChange}
            d="outlined-basic"
            label="Password"
            variant="outlined"
          />
          <Button onClick={signInUser}>Sign In</Button> */}
        </div>
      </motion.div>
    );
  }
}

export default SignIn;
