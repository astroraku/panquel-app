import React from "react";
import ReactDOM from "react-dom/client";

/* --------- CSS GLOBAL --------- */
import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/sidebar.css";

/* --------- CSS POR PANTALLA --------- */
import "./styles/nuevaorden.css";
import "./styles/productos.css";
import "./styles/historial.css";
import "./styles/ultimaorden.css";
import "./styles/proveedores.css";
import "./styles/AdminPerfiles.css"; // ⬅️ NUEVO

/* --------- PÁGINAS --------- */
import App from "./App";
import Login from "./pages/Login";
import NuevaOrden from "./pages/NuevaOrden";
import Productos from "./pages/Productos";
import Historial from "./pages/Historial";
import UltimaOrden from "./pages/UltimaOrden";
import Proveedores from "./pages/Proveedores";
import AdminPerfiles from "./pages/AdminPerfiles"; // ⬅️ NUEVO

/* --------- ROUTER --------- */
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";



/* ===============================
   🔐 SOLO USUARIOS LOGUEADOS
================================ */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

/* ===============================
   🔐 SOLO ADMIN
================================ */
function AdminRoute({ children }) {
  const rol = localStorage.getItem("rol");
  return rol === "admin" ? children : <Navigate to="/app" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>

      {/* REDIRECCIONES BASE */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* APP BASE (LAYOUT / SIDEBAR) */}
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <App />
          </PrivateRoute>
        }
      />

      {/* ÓRDENES */}
      <Route
        path="/nueva-orden"
        element={
          <PrivateRoute>
            <NuevaOrden />
          </PrivateRoute>
        }
      />

      <Route
        path="/ultima-orden"
        element={
          <PrivateRoute>
            <UltimaOrden />
          </PrivateRoute>
        }
      />

      {/* PRODUCTOS */}
      <Route
        path="/productos"
        element={
          <PrivateRoute>
            <Productos />
          </PrivateRoute>
        }
      />

      {/* HISTORIAL */}
      <Route
        path="/historial"
        element={
          <PrivateRoute>
            <Historial />
          </PrivateRoute>
        }
      />

      {/* PROVEEDORES */}
      <Route
        path="/proveedores"
        element={
          <PrivateRoute>
            <Proveedores />
          </PrivateRoute>
        }
      />

      {/* 🔒 ADMIN */}
      <Route
        path="/admin/perfiles"
        element={
          <AdminRoute>
            <AdminPerfiles />
          </AdminRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/app" replace />} />

    </Routes>
  </Router>
);