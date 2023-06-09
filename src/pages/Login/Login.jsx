import React, { useState } from "react";
import LoginStyled from "./LoginStyled";
import axios from "axios";
import io from "socket.io-client";
import usePageVisibility from "../../customHooks/usePageVisibility";

const socket = io(`${process.env.REACT_APP_PASSAGE}`);

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [gotCode, setGotCode] = useState(false);

  const [rCode, setRCode] = useState("");
  const [rId, setRId] = useState(null);
  const [resetPhone, setResetPhone] = useState("");
  const [usCode, setUsCode] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetPLoading, setResetPLoading] = useState(false);
  const [cCode, setCCode] = useState(false);
  const [newpassword, setNewPassword] = useState("");
  const [newpasswordC, setNewPasswordC] = useState("");
  document.title = "Welcome to Saloon Manager";
  document.body.style.backgroundColor = "#36056f";

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleForgotPasswordClick = () => {
    setForgotPassword(true);
  };

  const isVisible = usePageVisibility();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      const response = await axios.post("admin/login", {
        phone: username,
        password,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      socket.emit("logdin", {});
      window.location.reload();
      setLoginLoading(false);
    } catch (error) {
      const { response } = error;
      if (response.status === 400) {
        alert("Incorrect phone or password");
      } else {
        alert("Network error");
      }
      setLoginLoading(false);
    }
  };

  socket.on("logdin", () => {
    if (isVisible === false) window.location.reload();
  });

  const handleCodeEntry = async (e) => {
    e.preventDefault();
    if (usCode === rCode) {
      setGotCode(false);
      setCCode(true);
    } else {
      alert("Incorrect code");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setResetLoading(true);
      const response = await axios.get(
        `admin/get-reset-code?phone=${resetPhone}`
      );
      const { resetCode, id } = response.data;
      setRCode(resetCode);
      setRId(id);
      setForgotPassword(false);
      setResetPhone("");
      setGotCode(true);
      setResetLoading(false);
    } catch (error) {
      const { response } = error;
      if (response.status === 404) {
        alert(
          "Nta mu User uhari ukoresha iyo nimero.Please check again or contact the Admin."
        );
      } else {
        alert("Network error");
      }
      setResetLoading(false);
    }
  };

  const handleResetP = async (e) => {
    e.preventDefault();
    try {
      if (newpassword.length < 5) {
        alert("Password must be at least 5 characters long");
        return;
      } else if (newpassword !== newpasswordC) {
        alert("Passwords do not match");
        return;
      }
      setResetPLoading(true);
      if (!rId) {
        alert("Error.Refresh the page and try again.");
        return;
      }
      await axios.put(`admin/update-password/${rId}`, {
        newPassword: newpassword,
        pswdConfirm: newpasswordC,
      });
      alert("You have successfully reset your password.");
      setCCode(false);
      setResetPLoading(false);
      setUsCode("");
      setRCode("");
      setNewPassword("");
      setNewPasswordC("");
    } catch (error) {
      const { response } = error;
      if (response.status === 404) {
        alert("Invalid data");
      } else {
        alert("Network error");
      }
      setResetPLoading(false);
    }
  };

  if (forgotPassword) {
    return (
      <LoginStyled>
        <h2>Forgot Password</h2>
        <p>Andika nimero ya telephone.</p>
        <form onSubmit={handleReset}>
          <label htmlFor="phone">Phone number:</label>
          <input
            type="text"
            id="phone"
            maxLength={10}
            value={resetPhone}
            onChange={(e) => setResetPhone(e.target.value)}
            required
          />
          <button type="submit" disabled={resetLoading}>
            {resetLoading ? "Loading..." : "Next"}
          </button>
        </form>
        <button
          onClick={() => {
            setForgotPassword(false);
            setResetPhone("");
            setResetLoading(false);
          }}
          id="direct"
        >
          Back to Login
        </button>
      </LoginStyled>
    );
  }

  if (gotCode) {
    return (
      <LoginStyled>
        <h2>Code Sent</h2>
        <p>Andika code wabonye nka SMS kuri nimero +25{resetPhone}.</p>
        <form onSubmit={handleCodeEntry}>
          <label htmlFor="resetcode">Code:</label>
          <input
            type="text"
            id="resetcode"
            value={usCode}
            onChange={(e) => setUsCode(e.target.value)}
            required
          />
          <button type="submit">Next</button>
        </form>
        <button
          onClick={() => {
            setForgotPassword(true);
            setGotCode(false);
          }}
          id="direct"
        >
          Back
        </button>
      </LoginStyled>
    );
  }

  if (cCode) {
    return (
      <LoginStyled className="Login">
        <h2>Finish password reset</h2>
        <form onSubmit={handleResetP}>
          <label htmlFor="newpswd">Password:</label>
          <input
            type="password"
            id="newpswd"
            value={newpassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <label htmlFor="newpswdc">Confirm password:</label>
          <input
            type="password"
            id="newpswdc"
            value={newpasswordC}
            onChange={(e) => setNewPasswordC(e.target.value)}
            required
          />
          <button type="submit" disabled={resetPLoading}>
            {resetPLoading ? "Resetting password..." : "Finish"}
          </button>
        </form>
        <button
          onClick={() => {
            setCCode(false);
            setForgotPassword(false);
            setUsCode("");
            setRCode("");
            setNewPassword("");
            setNewPasswordC("");
          }}
          id="direct"
        >
          Switch to Login
        </button>
      </LoginStyled>
    );
  }

  return (
    <LoginStyled className="Login">
      <h2>SalonSense Login</h2>
      <form onSubmit={handleLogin}>
        <label htmlFor="username">Phone number:</label>
        <input
          type="text"
          id="username"
          maxLength={10}
          value={username}
          onChange={handleUsernameChange}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <button
          type="submit"
          disabled={loginLoading}
          style={{
            cursor: loginLoading ? "no-drop" : "pointer",
          }}
        >
          {loginLoading ? "Loading..." : "Login"}
        </button>
      </form>
      <button onClick={handleForgotPasswordClick} id="direct">
        Forgot Password?
      </button>
    </LoginStyled>
  );
};

export default Login;
