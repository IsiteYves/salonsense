import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      style={{ width: "fit-content", margin: "2rem auto", textAlign: "center" }}
    >
      <h2>404 Not Found</h2>
      <p>Sorry, we couldn't find the page you're looking for.</p>
      <Link
        to="/"
        style={{
          padding: "7px 11px",
          borderRadius: "4px",
          color: "#fff",
          textDecoration: "none",
          background: "dodgerblue",
        }}
      >
        Back to App
      </Link>
    </div>
  );
}

export default NotFound;
