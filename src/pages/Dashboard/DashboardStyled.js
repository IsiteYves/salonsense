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
  .sidebar > h2 {
    background-color: #fff;
    padding: 1.4rem 2rem;
    margin-bottom: 1rem;
    font-size: 21px;
    text-transform: uppercase;
    color: #411475;
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
  .main-content > div:first-of-type {
    overflow-y: auto !important;
    max-height: 100vh !important;
  }
  .main-content,
  .main-content > div:first-of-type,
  table {
    width: 100%;
  }
  .main-content > div:first-of-type h2 {
    color: #6622b4;
    position: sticky;
    background-color: #fff;
    font-weight: 700 !important;
    font-size: 20px !important;
    top: 0;
    box-shadow: 0 0 15px #808080;
    z-index: 99 !important;
  }
  .main-content > div:first-of-type > * {
    padding: 1rem 2rem;
  }
  table {
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
  }
  .main-content > div:first-of-type > button,
  .main-content > div:first-of-type > * > button {
    font-weight: 700;
    border-radius: 3px;
    padding: 10px 15px;
    color: #fff;
    transition: all 0.5s ease;
    background: rgb(11, 95, 179);
  }
  .main-content > div:first-of-type > button:hover,
  .main-content > div:first-of-type > * > button:hover {
    background: dodgerblue;
  }
`;

export default DashboardStyled;
