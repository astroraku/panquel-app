import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import "../styles/NuevaOrden.css";
import { generarPDFDesdeDatos } from "../utils/pdf";

// 🔗 URL BACKEND
const API_URL = "http://127.0.0.1:8000/api";

export default function NuevaOrden() {
  const navigate = useNavigate();

  /* =====================================================
     🔥 ESTADO BACKEND
  ===================================================== */

  const [backendActivo, setBackendActivo] = useState(false);
  const [verificandoBackend, setVerificandoBackend] = useState(true);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [hayCambios, setHayCambios] = useState(false);
  const [ordenHoyRealizada, setOrdenHoyRealizada] = useState(false);
  const [mostrarModalBloqueo, setMostrarModalBloqueo] = useState(false);

  const verificarOrdenDelDia = async () => {
  try {
    const res = await fetch(`${API_URL}/historial/`); // O el endpoint donde obtienes las órdenes finalizadas
    const ordenes = await res.json();
    
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Buscamos si hay alguna orden cuya fecha sea hoy
    const yaExiste = ordenes.some(orden => {
      const fechaOrden = new Date(orden.fecha).toISOString().split('T')[0];
      return fechaOrden === hoy;
    });

    if (yaExiste) {
      setOrdenHoyRealizada(true);
    }
  } catch (error) {
    console.error("Error verificando orden del día:", error);
  }
};

  useEffect(() => {
    let intervalo;

    async function verificarBackend() {
      try {
        const response = await fetch(`${API_URL}/ia/wake/`);
        const data = await response.json();

        if (data.status === "ready") {
          setBackendActivo(true);
          setVerificandoBackend(false);
          clearInterval(intervalo);
        }
      } catch (error) {
        setBackendActivo(false);
        setVerificandoBackend(false);
      }
    }

    verificarBackend();
    verificarOrdenDelDia();
    intervalo = setInterval(() => {
      if (!backendActivo) {
        verificarBackend();
      }
    }, 10000);

    return () => clearInterval(intervalo);
  }, [backendActivo]);




  /* =====================================================
     🤖 ESTADO IA NUEVO
  ===================================================== */

  const [cargandoIA, setCargandoIA] = useState(false);

  async function cargarPrediccionIA() {
    try {
      setCargandoIA(true);
      const response = await fetch(`${API_URL}/ia/predict/?epochs=20&top=0`);
      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        // 🔥 CORRECCIÓN: Mapear sobre los productos existentes
        const nuevaListaIA = productos.map(p => {
          const pred = data.results.find(r => r.Producto === p.nombre);
          return pred 
            ? { ...p, cantidad: parseInt(pred.Pred_Sig_Semana) || 0 }
            : p;
        });

        setProductos(nuevaListaIA);
        setOrdenIniciada(true);
        setHayCambios(true); 
      }
      setCargandoIA(false);
    } catch (error) {
      console.error("Error IA:", error);
      setCargandoIA(false);
    }
  }

  /* ===================================================== */

  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarAbierto", sidebarAbierto);
  }, [sidebarAbierto]);

  const [ordenIniciada, setOrdenIniciada] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [avisoGuardado, setAvisoGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);

  const [busqueda, setBusqueda] = useState("");

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

const [productosPorPagina, setProductosPorPagina] = useState(5);
const tablaRef = useRef(null);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    setProductosFiltrados(productos);
  }, [productos]);

  useEffect(() => {
    const texto = busqueda.toLowerCase();

    const filtrados = productos.filter((p) => {
      const nombre = p.nombre || "";
      const proveedor = p.proveedor_nombre || "";
      return (
        nombre.toLowerCase().includes(texto) ||
        proveedor.toLowerCase().includes(texto)
      );
    });

    setProductosFiltrados(filtrados);
  }, [busqueda, productos]);

  useEffect(() => {
  setPaginaActual(1);
}, [busqueda]);

  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;

    // 🔽 ORDENAR POR PROVEEDOR (A-Z)
    const productosOrdenados = [...productosFiltrados].sort((a, b) =>
      (a.proveedor_nombre || "").localeCompare(b.proveedor_nombre || "")
    );

    const productosPagina = productosOrdenados.slice(
      indicePrimero,
      indiceUltimo
    );

    const totalPaginas = Math.ceil(
      productosOrdenados.length / productosPorPagina
    );



  /* ===================================================== */

 function handleGenerarOrden() {
    // 🚀 CAMBIO: Si ya se hizo una orden hoy, bloqueamos y mostramos modal
    if (ordenHoyRealizada) {
      setMostrarModalBloqueo(true);
      return;
    }

    if (!backendActivo) {
      alert("El servidor aún no está listo");
      return;
    }

    cargarPrediccionIA();
  }

  function handleFinalizar() {
      // 🚀 BLOQUEO: Si ya se hizo una orden hoy, no permitimos abrir el modal de finalizar
      if (ordenHoyRealizada) {
        setMostrarModalBloqueo(true);
        return;
      }
      setMostrarModal(true);
    }

  function cancelarFinalizar() {
    setMostrarModal(false);
  }


  useEffect(() => {
    const calcularFilas = () => {
      if (!tablaRef.current) return;

      const contenedor = tablaRef.current;
      const rect = contenedor.getBoundingClientRect();
      
      // 1. Calculamos altura disponible restando el margen inferior para los botones
      // Usamos -80 para dejar espacio a la barra de paginación
      const alturaDisponible = window.innerHeight - rect.top - 80;

      // 2. Valores estándar (deben coincidir con el CSS)
      const alturaHeader = 45; 
      const alturaFila = 61;

      // 3. Cálculo matemático de filas que caben
      const espacioParaFilas = alturaDisponible - alturaHeader;
      const filas = Math.floor(espacioParaFilas / alturaFila);

      // 4. Actualizar estado (mínimo 3 filas)
      setProductosPorPagina(filas > 3 ? filas -1: 3);
    };

    // Pequeño delay para asegurar que el DOM está listo tras el renderizado
    const timeout = setTimeout(calcularFilas, 60);

    window.addEventListener("resize", calcularFilas);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", calcularFilas);
    };
  }, [productosFiltrados, sidebarAbierto]); // Se dispara al filtrar o mover el sidebar


useEffect(() => {
  async function inicializarDatos() {
    try {
      console.log("Iniciando carga de datos...");

      // 1. Obtener catálogo base
      const resProductos = await fetch(`${API_URL}/producto/`);
      const todosLosProductos = await resProductos.json();

      if (!Array.isArray(todosLosProductos)) {
        console.error("El catálogo no es un array:", todosLosProductos);
        return;
      }

      let listaBase = todosLosProductos.map((p, index) => ({
        id: p.id || `prod-${index}`,
        nombre: p.nombre,
        proveedor_nombre: p.proveedor_nombre || "General",
        cantidad: 0
      }));

      // 2. Obtener datos de la orden activa
      try {
        const resActual = await fetch(`${API_URL}/prediccion/actual/`);
        const dataActual = await resActual.json();

        if (dataActual && dataActual.activa && Array.isArray(dataActual.productos)) {
          console.log("Orden activa detectada:", dataActual.productos);
          setOrdenIniciada(true);

          // Cruce de datos blindado (comparamos nombres ignorando espacios y mayúsculas)
          listaBase = listaBase.map(pBase => {
            const coincidencia = dataActual.productos.find(
              g => g.nombre.trim().toLowerCase() === pBase.nombre.trim().toLowerCase()
            );

            if (coincidencia) {
              // Extraemos el valor del backend
              const valor = coincidencia.valor_predicho ?? coincidencia.cantidad ?? 0;
              console.log(`✅ Asignando ${valor} a ${pBase.nombre}`);
              return { ...pBase, cantidad: Number(valor) };
            }
            return pBase;
          });
        } else {
          setOrdenIniciada(false);
        }
      } catch (err) { // 🔥 CORREGIDO: Aquí estaba el error del token
        console.warn("No se pudo recuperar la orden activa o no hay ninguna.");
      }

      // 3. ACTUALIZACIÓN DE ESTADOS
      setProductos(listaBase);
      setProductosOriginales(JSON.parse(JSON.stringify(listaBase)));
      setHayCambios(false);

    } catch (error) {
      console.error("Error general en inicializarDatos:", error);
    }
  }

  inicializarDatos();
}, []);

  /* =====================================================
     🔥 NUEVO: GUARDAR EN BACKEND (COLUMNA)
  ===================================================== */

async function guardarOrdenBackend() {
  try {
    const productosFiltrados = productos.filter(p => p.cantidad > 0);

    if (productosFiltrados.length === 0) {
      alert("No hay productos con cantidad mayor a 0");
      return false;
    }

    // 🔥 NUEVO: calcular proveedores aquí
    const proveedoresUsados = [
      ...new Set(
        productosFiltrados.map(p => p.proveedor_nombre || "General")
      )
    ];

    const response = await fetch(`${API_URL}/prediccion/guardar/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productos: productosFiltrados.map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad
        })),
        proveedores: proveedoresUsados
      }),
    });

    let data = null;

    // 🔥 IMPORTANTE: intentar leer respuesta aunque falle
    try {
      data = await response.json();
    } catch (e) {
      console.warn("La respuesta no es JSON");
    }

    if (!response.ok) {
      console.error("❌ Error del backend:", data);

      // 🔥 Mensaje más claro
      const mensaje =
        data?.error ||
        data?.detail ||
        "Error desconocido al guardar la orden";

      alert(`Error: ${mensaje}`);
      return false;
    }

    console.log("✅ Orden guardada:", data);
    return true;

  } catch (error) {
    console.error("❌ Error de conexión:", error);

    alert("No se pudo conectar con el servidor");
    return false;
  }
}

  /* ===================================================== */

  async function guardarOrden() {
  const ok = await guardarOrdenBackend();
  if (ok) {
    setProductosOriginales([...productos]); // 🔥 Ahora lo actual coincidirá con lo guardado
    setHayCambios(false); 
    setErrorGuardado(false);
    setAvisoGuardado(true);
    setTimeout(() => setAvisoGuardado(false), 2500);
  }else {
      setErrorGuardado(true);
      setAvisoGuardado(true);

      setTimeout(() => setAvisoGuardado(false), 2500);
    }
  }

  async function resetearOrdenIA() {
    if (!backendActivo) {
      alert("El servidor no está disponible");
      return;
    }

    // Limpia UI mientras carga
    setOrdenIniciada(false);
    setProductos(productosOriginales);
    setBusqueda("");
    setPaginaActual(1);

    // 🔥 IMPORTANTE: vuelve a llamar IA
    await cargarPrediccionIA();
    setHayCambios(false);
  }


  async function finalizarOrdenBackend() {
    try {
      const productosFiltrados = productos.filter(p => p.cantidad > 0);

      const response = await fetch(`${API_URL}/orden/crear-columna/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productos: productosFiltrados.map(p => ({
            nombre: p.nombre,
            cantidad: p.cantidad
          }))
        }),
      });

      if (!response.ok) {
        alert("Error al finalizar orden");
        return false;
      }

      return true;

    } catch (error) {
      console.error(error);
      return false;
    }
  }

/* --- REEMPLAZA ESTA FUNCIÓN EN TU CÓDIGO --- */
async function confirmarFinalizar() {
  try {
    const ok = await finalizarOrdenBackend();

    if (!ok) return;

    // 🔥 NUEVO: obtener proveedores usados
    const proveedoresUsados = [
      ...new Set(
        productos
          .filter(p => p.cantidad > 0)
          .map(p => p.proveedor_nombre || "General")
      )
    ];



    await fetch(`${API_URL}/prediccion/limpiar/`, {
      method: "POST"
    });
    console.log("Proveedores usados:", proveedoresUsados);
    generarPDFDesdeDatos({
      productos: productos,
      proveedor: proveedoresUsados.join(", "), // 🔥 DIRECTO
      fecha: new Date().toLocaleDateString()
    });

    setOrdenHoyRealizada(true);
    setOrdenIniciada(false);
    setHayCambios(false);
    setMostrarModal(false);

    setMostrarAviso(true);
    setTimeout(() => setMostrarAviso(false), 2500);

    const productosReset = productos.map(p => ({ ...p, cantidad: 0 }));
    setProductos(productosReset);
    setProductosOriginales(JSON.parse(JSON.stringify(productosReset)));

  } catch (error) {
    console.error("Error al finalizar:", error);
  }
}

  return (
    <div className="layout">
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
      />

      <main className={`contenido ${sidebarAbierto ? "con-sidebar" : "sin-sidebar"}`}>
        <div className="barra-superiorNO">
          <input
            type="text"
            placeholder="Buscar producto o proveedor"
            className="input-proveedorNO"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          {!ordenIniciada ? (
            <>
              <button
                className="btn-normalNO"
                onClick={handleGenerarOrden}
                // 🚀 Bloqueo si el backend no está listo, si está cargando o si ya se hizo hoy
                disabled={!backendActivo || cargandoIA || ordenHoyRealizada}
                style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                {verificandoBackend ? "Conectando..." : cargandoIA ? "Generando con IA..." : "Generar Orden"}
              </button>
              
              {hayCambios && (
                <>
                  <button 
                    className="btn-normalNO" 
                    onClick={guardarOrden}
                    disabled={ordenHoyRealizada}
                    style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                  >
                    Guardar Borrador
                  </button>
                  <button 
                    className="btn-normalNO" 
                    onClick={handleFinalizar}
                    disabled={ordenHoyRealizada}
                    style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                  >
                    Finalizar
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button 
                className="btn-normalNO" 
                onClick={guardarOrden}
                disabled={ordenHoyRealizada}
                style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                {hayCambios ? "Guardar Cambios" : "Guardado"}
              </button>
              <button 
                className="btn-normalNO" 
                onClick={resetearOrdenIA}
                disabled={ordenHoyRealizada}
                style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                Resetear Orden IA
              </button>
              <button 
                className="btn-normalNO" 
                onClick={handleFinalizar}
                disabled={ordenHoyRealizada}
                style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                Finalizar
              </button>
            </>
          )}
        </div>

      <div className="tabla-contenedorNO" ref={tablaRef}>
        <table className="tabla-estandar">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Proveedor</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.proveedor_nombre}</td>
                
                {/* AQUÍ VA EL BLOQUE DEL INPUT */}
                <td>
                  <input
                    type="number"
                    min="0"
                    className="input-tablaNO"
                    value={p.cantidad} // 🔥 Asegúrate que diga p.cantidad
                    onChange={(e) => {
                      const valor = Number(e.target.value);
                      const cantidadSegura = isNaN(valor) ? 0 : Math.max(0, valor);

                      const nuevosProductos = productos.map((prod) =>
                        prod.id === p.id
                          ? { ...prod, cantidad: cantidadSegura }
                          : prod
                      );

                      setProductos(nuevosProductos);

                      const existeCambio = JSON.stringify(nuevosProductos) !== JSON.stringify(productosOriginales);
                      setHayCambios(existeCambio);
                    }}
                  />
                </td>
                {/* FIN DEL BLOQUE */}
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              ◀ Anterior
            </button>

            <span>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              Siguiente ▶
            </button>
          </div>
        )}
      </main>

    {/* 🚀 CAMBIO: Modal de bloqueo por orden ya realizada */}
          {mostrarModalBloqueo && (
            <div className="modal-overlay">
              <div className="modal">
                <h3 style={{ color: "#d9534f" }}>⚠️ Acción denegada</h3>
                <p className="pNO">Ya se ha procesado una orden el día de hoy. No es posible generar una nueva hasta mañana.</p>
                <div className="modal-buttonsNO">
                  <button className="btn-normalNO" onClick={() => setMostrarModalBloqueo(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal modal-finalizar">
            <h3>¿Finalizar la orden?</h3>
            <p className="pNO">Se generará un PDF con esta orden.</p>

            <div className="modal-buttonsNO">
              <button className="btn-normalNO" onClick={cancelarFinalizar}>
                Cancelar
              </button>
              <button className="btn-normalNO" onClick={confirmarFinalizar}>
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarAviso && (
        <div className="avisoNO">
          <p>✔ Orden Finalizada y PDF generado</p>
        </div>
      )}

      {avisoGuardado && (
        <div className="avisoNO">
          <p>
            {errorGuardado
              ? "❌ Error al guardar"
              : "✔ Orden guardada correctamente"}
          </p>
        </div>
      )}
    </div>
  );
}