import React, { useState } from "react";
import { FormField, PrimaryButton, TextInput } from "../../../../components/ui";
import "./styles.css";

function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      className="pp-sign-in-form__password-toggle"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 3l18 18M10.58 10.58A2 2 0 0012 15a2 2 0 001.41-3.41M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 01-2.16 3.19M6.61 6.61A11.73 11.73 0 001 12.5C2.73 16.89 7 20 12 20a11.6 11.6 0 004.39-.84"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M1 12.5C2.73 7.11 7 4 12 4s9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.89 1 12.5z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      )}
    </button>
  );
}

function AuthForm({
  isSignIn,
  isLoading,
  error,
  onBack,
  onToggleMode,
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validate = () => {
    let valid = true;

    if (!isSignIn) {
      if (
        !name ||
        name.length < 2 ||
        /\d/g.test(name) ||
        /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/g.test(name) ||
        /\p{Emoji}/u.test(name)
      ) {
        setNameError("Please enter a valid name.");
        valid = false;
      } else {
        setNameError("");
      }

      if (
        !phone ||
        /[a-zA-Z]/.test(phone) ||
        /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/g.test(phone) ||
        phone.length !== 10 ||
        phone.at(0) === "0"
      ) {
        setPhoneError(
          /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/g.test(phone)
            ? "Please only include numbers."
            : "Please enter a valid phone number."
        );
        valid = false;
      } else {
        setPhoneError("");
      }
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password || password.length < 5) {
      setPasswordError("Password must be at least 5 characters long.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    onSubmit({ name, email, password, phone, isSignIn });
  };

  const canSubmit = isSignIn
    ? email.length > 0 && password.length > 0
    : name.length > 0 && email.length > 0 && password.length > 0 && phone.length > 0;

  return (
    <div className="pp-sign-in-form">
      <button type="button" className="pp-sign-in-form__back" onClick={onBack} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="pp-sign-in-form__content">
        <h1 className="pp-sign-in-form__title">{isSignIn ? "Log In" : "Sign Up"}</h1>
        <p className="pp-sign-in-form__subtitle">
          {isSignIn
            ? "Enter your email and password to continue."
            : "Create your account to get started."}
        </p>

        {error && (
          <p className="pp-sign-in-form__error-banner" role="alert">
            {error}
          </p>
        )}

        <form
          className="pp-sign-in-form__fields"
          onSubmit={(event) => {
            event.preventDefault();
            validate();
          }}
          noValidate
        >
          {!isSignIn && (
            <>
              <FormField id="name" label="First Name" error={nameError}>
                <TextInput
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value.charAt(0).toUpperCase().trim() +
                        e.target.value.slice(1).trim()
                    )
                  }
                  placeholder="John"
                  autoComplete="name"
                  error={Boolean(nameError)}
                />
              </FormField>

              <FormField id="phone" label="Phone Number" error={phoneError}>
                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="6619772543"
                  autoComplete="tel"
                  error={Boolean(phoneError)}
                />
              </FormField>
            </>
          )}

          <FormField id="email" label="Email" error={emailError}>
            <TextInput
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete={isSignIn ? "email" : "email"}
              error={Boolean(emailError)}
            />
          </FormField>

          <FormField id="password" label="Password" error={passwordError}>
            <TextInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={isSignIn ? "current-password" : "new-password"}
              error={Boolean(passwordError)}
              endAdornment={
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                />
              }
            />
          </FormField>

          <PrimaryButton
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={!canSubmit}
          >
            {isSignIn ? "Log In" : "Sign Up"}
          </PrimaryButton>
        </form>

        <p className="pp-sign-in-form__toggle">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" className="pp-sign-in-form__toggle-btn" onClick={onToggleMode}>
            {isSignIn ? "Sign Up" : "Log In"}
          </button>
        </p>

        {!isSignIn && (
          <p className="pp-sign-in-form__legal">
            By signing up, you are agreeing to our{" "}
            <a href="/terms" className="pp-sign-in-form__legal-link">
              terms and conditions
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
