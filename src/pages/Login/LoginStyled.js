import styled from "styled-components";

const LoginStyled = styled.div`
  max-width: 400px;
  margin: 5rem auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  h2 {
    margin-top: 0;
    font-size: 28px;
    font-weight: 600;
    color: #333;
  }

  label {
    display: block;
    margin-bottom: 5px;
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    color: #666;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"] {
    width: 95%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    outline: none;
    color: #333;
  }

  input[type="text"]:focus,
  input[type="email"]:focus,
  input[type="password"]:focus {
    box-shadow: 0 0 0 3px #1e8fffa2;
  }

  button[type="submit"],
  button {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    background-color: #333;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button[type="submit"]:hover,
  button:hover {
    background-color: #555;
  }

  #direct {
    margin-top: 1rem;
  }
`;

export default LoginStyled;
