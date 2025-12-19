import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Window } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import "../styles/Login.css";

import panquelLogo from "../img/panquel.gif";

// 🔹 URL del backend Django
const API_URL = "http://127.0.0.1:8000/api";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimar(true), 50);

    async function ajustarVentana() {
      const isTauri = "__TAURI_IPC__" in window;
      if (!isTauri) return;

      const win = Window.getCurrent();
      await win.setSize(new LogicalSize(400, 550));
      await win.center();
    }

    ajustarVentana();
  }, []);

  // 🔐 LOGIN CON DJANGO
  const manejarLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario,
          password,
        }),
      });

      const data = await response.json();
      
      console.log("STATUS:", response.status);
      console.log("DATA:", data);

      if (response.ok && data.success) {
        const win = Window.getCurrent();

        await win.setSize(new LogicalSize(1200, 800));
        await win.center();

        navigate("/app");
      } else {
        setError(data.mensaje || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar al servidor");
    }
  };

  return (
    <div className="login-contenedor">
      <form
        className={`login-card ${animar ? "mostrar" : ""}`}
        onSubmit={manejarLogin}
      >
        <img src={panquelLogo} alt="Logo" className="login-logo" />

        <h2>Iniciar Sesión</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
