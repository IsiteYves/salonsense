import styled from "styled-components";

const DashboardStyled = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  .sidebar {
    background-color: #411475;
    padding: 2rem 1rem;
    border-right: 1px solid #808080;
  }
  .sidebar ul {
    list-style: none;
  }
  .sidebar ul > li {
    cursor: pointer;
  }
  .sidebar ul > li:last-of-type,
  .sidebar ul > li a {
    padding: 14px 2rem;
    display: block;
    background: #6622b4;
    color: #fff;
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  .sidebar ul > li:last-of-type:hover,
  .sidebar ul > li a:hover {
    background: #36056f;
  }
  .sidebar ul > li:not(:last-of-type) {
    margin-bottom: 1rem;
  }
  .sidebar ul > li a {
    width: 20rem;
    text-decoration: none;
    color: #fff;
  }
  .main-content {
    width: 100%;
  }
  .main-content > div:first-of-type h2 {
    color: #6622b4;
    position: sticky;
    top: 0;
    box-shadow: 0 0 15px #808080;
  }
  .main-content > div:first-of-type > * {
    padding: 1rem 2rem;
  }
  .main-content > div:first-of-type {
    width: 100%;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    font-size: 14px;
    margin-bottom: 20px;
  }

  table th {
    background-color: #f2f2f2;
    color: #333;
    text-align: left;
    padding: 10px;
    border: 1px solid #ddd;
  }

  table td {
    padding: 10px;
    border: 1px solid #ddd;
  }
  .main-content > div:first-of-type > button {
    margin: 2rem 0 0 2rem;
    font-weight: 700;
  }
`;

export default DashboardStyled;