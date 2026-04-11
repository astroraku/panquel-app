import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogicalSize } from "@tauri-apps/api/dpi";
import "../styles/Login.css";
import { Eye, EyeOff } from "lucide-react";
import panquelLogo from "../img/logofondo.png";
import { Window, currentMonitor } from "@tauri-apps/api/window";

import { getCurrentWindow } from "@tauri-apps/api/window";

// 🔹 URL del backend Django
const API_URL = "http://127.0.0.1:8000/api";


async function despertarBackend() {
  try {
    console.log("🔥 Despertando modelo vía Django...");

    await fetch("http://127.0.0.1:8000/api/ia/despertar/");

    console.log("✅ Modelo activo o en proceso");
  } catch (error) {
    console.log("⚠️ Modelo dormido o backend no listo");
  }
}

async function esperarBackend() {
  let conectado = false;

  while (!conectado) {
    try {

      const res = await fetch("http://127.0.0.1:8000/api/producto/");

      if (res.ok) {
        conectado = true;
        console.log("Backend listo");
      }
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

export default function Login() {


  useEffect(() => {
    if (!window.__TAURI__) return;

    const appWindow = getCurrentWindow();
    let unlisten;

    const cerrar = async (event) => {
      event.preventDefault();
      try {
        await fetch("http://127.0.0.1:8000/api/cerrar-backend/");
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error("Error cerrando backend:", error);
      }
      await appWindow.close();
    };

    const setupListener = async () => {
      unlisten = await appWindow.onCloseRequested(cerrar);
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [animar, setAnimar] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnimar(true), 50);
    despertarBackend() 
    async function ajustarVentana() {
      const isTauri = "__TAURI_IPC__" in window;
      if (!isTauri) return;

      await esperarBackend();

      const win = Window.getCurrent();
      await win.setSize(new LogicalSize(490, 440));
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

      /* ===============================
        👑 NORMALIZAR ROL
        superusuario => admin
      ================================ */
      let rolFinal = data.rol;

      if (data.is_superuser === true) {
        rolFinal = "admin";
      }

      // 🔐 GUARDAR SESIÓN
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", rolFinal);

      console.log("TOKEN GUARDADO:", data.token);
      console.log("ROL FINAL:", rolFinal);

    const win = Window.getCurrent();

    // 🔥 tamaño dinámico correcto
    const monitor = await currentMonitor();

    if (monitor) {
      const { width, height } = monitor.size;

      const newWidth = Math.min(1200, width * 0.8);
      const newHeight = Math.min(800, height * 0.8);

      await win.setSize(new LogicalSize(newWidth, newHeight));
    }

    await win.center();

      console.log("LOGIN OK, navegando...");
      navigate("/app");
    } else {
        setError(data.mensaje || "Credenciales incorrectas");
      }
    } catch (err) {
  console.error("DEBUG COMPLETO:", err);

  let mensajeDetallado = "Error de conexión";

  // 1. Detectar si el navegador bloqueó la petición (CORS o Red)
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    mensajeDetallado = "Bloqueo de red: El backend no responde o Tauri bloqueó la salida. Verifica que el Sidecar esté corriendo en el puerto 8000.";
  } 
  // 2. Errores de tiempo de espera o aborto
  else if (err.name === "AbortError") {
    mensajeDetallado = "La petición tardó demasiado y fue cancelada.";
  }
  // 3. Otros errores con mensaje
  else if (err.message) {
    mensajeDetallado = err.message;
  }

  setError(`Detalle Técnico: ${mensajeDetallado}`);
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
        
        <div className="int">
          {/* Input de Usuario */}
          <input
            type="text"
            className="login-input"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          {/* Grupo de Password */}
          <div className="password-group">
            <input
              type={mostrarPassword ? "text" : "password"}
              className="login-input input-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn-toggle-password"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              tabIndex="-1"
            >
              {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn-entrar">Entrar</button>
        </div>
      </form>
    </div>
  );
}
