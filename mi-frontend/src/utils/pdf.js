import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generarPDFDesdeDatos({ proveedor, fecha, productos }) {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text("Orden de Compra", 14, 20);

  doc.setFontSize(12);

  // 👇 Hace salto automático de línea
  const proveedoresTexto = `Proveedor: ${proveedor}`;

  const proveedoresLineas = doc.splitTextToSize(
    proveedoresTexto,
    180 // ancho máximo
  );

  doc.text(proveedoresLineas, 14, 35);

  // 👇 Calcula automáticamente dónde poner la fecha
  const alturaProveedor = proveedoresLineas.length * 7;

  doc.text(`Fecha: ${fecha}`, 14, 35 + alturaProveedor);

  // Filtrar productos con cantidad
  const productosFiltrados = productos.filter(p => p.cantidad > 0);

  // Convertir a filas
  const rows = productosFiltrados.map(p => [
    p.nombre,
    p.cantidad
  ]);

  // Tabla automática
  autoTable(doc, {
    startY: 50 + alturaProveedor,

    head: [["Producto", "Cantidad"]],
    body: rows,

    styles: {
      fontSize: 10,
      valign: "middle",
    },

    headStyles: {
      fillColor: [139, 94, 52],
      halign: "center", // 👈 centra texto del encabezado
    },

    columnStyles: {
      0: {
        cellWidth: 140
      },

      1: {
        halign: "center", // 👈 centra los números
        cellWidth: 40
      }
    },

    didDrawPage: (data) => {
      doc.setFontSize(10);

      doc.text(
        `Página ${doc.internal.getNumberOfPages()}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    }
  });

  doc.save(`orden_${fecha}.pdf`);
}