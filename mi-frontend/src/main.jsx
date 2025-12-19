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

/* --------- PÁGINAS --------- */
import App from "./App";
import Login from "./pages/Login";
import NuevaOrden from "./pages/NuevaOrden";
import Productos from "./pages/Productos";
import Historial from "./pages/Historial";
import UltimaOrden from "./pages/UltimaOrden";
import Proveedores from "./pages/Proveedores";

/* --------- ROUTER --------- */
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      {/* Login */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* App base */}
      <Route path="/app" element={<App />} />

      {/* Órdenes */}
      <Route path="/nueva-orden" element={<NuevaOrden />} />
      <Route path="/ultima-orden" element={<UltimaOrden />} />

      {/* Productos */}
      <Route path="/productos" element={<Productos />} />

      {/* Historial */}
      <Route path="/historial" element={<Historial />} />

      {/* Proveedores */}
      <Route path="/proveedores" element={<Proveedores />} />
    </Routes>
  </Router>
);
