import { useNavigate } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import "./styles/App.css";
import panquelLogo from "./img/logofondo.png";
import { useState, useEffect } from "react";

export default function App() {

  const navigate = useNavigate();

  useEffect(() => {

    const disableContextMenu = (e) => e.preventDefault();

    const blockKeys = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", disableContextMenu);
    window.addEventListener("keydown", blockKeys);

    return () => {
      window.removeEventListener("contextmenu", disableContextMenu);
      window.removeEventListener("keydown", blockKeys);
    };

  }, []);

  // -------- SIDEBAR --------

  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarAbierto", sidebarAbierto);
  }, [sidebarAbierto]);

  const toggleSidebar = () => {
    setSidebarAbierto(!sidebarAbierto);
  };

  // -------- DASHBOARD DATA --------

  const [dashboard, setDashboard] = useState({
    totalProductos: 0,
    stockBajo: 0,
    pedidosPendientes: 0,
    proveedoresUnicos: 0,
    ultimaActualizacion: "",
    proveedorMasUsado: "",
    productoMasPedido: ""
  });

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/dashboard/", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {

        console.log("Dashboard:", data);

        setDashboard(data);

      })
      .catch(err => console.error(err));

  }, []);

  return (

    <div className="layout">

      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      <div className="contenido">



              <div className="dashboard-grid">

        <div className="tarjeta dashboard-box">
          <h2>Total productos</h2>
          <p className="numero">{dashboard.totalProductos}</p>
        </div>

        <div className="tarjeta dashboard-box">
          <h2>Proveedores registrados</h2>
          <p className="numero">{dashboard.totalProveedores}</p>
        </div>

        <div className="tarjeta dashboard-box">
          <h2>Órdenes realizadas</h2>
          <p className="numero">{dashboard.totalOrdenes}</p>
        </div>

        <div className="tarjeta dashboard-box">
          <h2>Proveedor más usado</h2>
          <p className="numero">{dashboard.proveedorMasUsado}</p>
        </div>

        <div className="tarjeta dashboard-box">
          <h2>Producto más pedido</h2>
          <p className="numero">{dashboard.productoMasPedido}</p>
        </div>

        <div className="tarjeta dashboard-box">
          <h2>Consumo semanal</h2>
          <p className="numero">{dashboard.consumoSemanal}</p>
        </div>

        <div className="tarjeta dashboard-box">
          <h2>Top producto del mes</h2>
          <p className="numero">{dashboard.topProductoMes}</p>
        </div>

        <div className="tarjeta dashboard-box">
          <h2>Proveedor menos usado</h2>
          <p className="numero">{dashboard.proveedorMenosUsado}</p>
        </div>

        <div className="tarjeta dashboard-box">
          <h2>Producto menos vendido</h2>
          <p className="numero">{dashboard.productoMenosVendido}</p>
        </div>
      </div>

      </div>

    </div>

  );

}