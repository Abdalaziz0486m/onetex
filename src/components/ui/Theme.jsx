// src/components/Theme.jsx
import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaLaptop } from "react-icons/fa";

export default function Theme() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme) => {
    const html = document.documentElement;
    if (theme === "light") {
      html.setAttribute("data-theme", "light");
    } else if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.setAttribute("data-theme", isDark ? "dark" : "light");
    }
  };

  const toggleTheme = () => {
    const nextTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  const getIcon = () => {
    const iconStyle = { transition: "transform 0.3s ease", fontSize: "1.4rem" };
    if (theme === "light")
      return (
        <FaSun
          style={{ ...iconStyle, color: "#f58634", transform: "rotate(0deg)" }}
        />
      );
    if (theme === "dark")
      return (
        <FaMoon
          style={{
            ...iconStyle,
            color: "#3e4095",
            transform: "rotate(180deg)",
          }}
        />
      );
    return (
      <FaLaptop
        style={{ ...iconStyle, color: "#555", transform: "rotate(360deg)" }}
      />
    );
  };

  return (
    <button
      className="border rounded-circle d-flex align-items-center justify-content-center"
      onClick={toggleTheme}
      style={{
        width: "42px",
        height: "42px",
        transition: "background 0.3s ease",
      }}
      title={`Current theme: ${theme}`}
    >
      {getIcon()}
    </button>
  );
}
