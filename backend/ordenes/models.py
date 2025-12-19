from django.db import models


# ========================
# PROVEEDORES
# ========================
class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True)
    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


# ========================
# PRODUCTOS
# ========================
class Producto(models.Model):
    nombre = models.CharField(max_length=100)

    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.CASCADE,
        related_name="productos"
    )

    def __str__(self):
        return f"{self.nombre} ({self.proveedor.nombre})"


# ========================
# ORDENES
# ========================
class Orden(models.Model):
    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.CASCADE,
        related_name="ordenes"
    )
    fecha = models.DateTimeField(auto_now_add=True)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"Orden #{self.id} - {self.proveedor.nombre}"


# ========================
# DETALLE DE ORDEN
# ========================
class DetalleOrden(models.Model):
    orden = models.ForeignKey(
        Orden,
        on_delete=models.CASCADE,
        related_name="detalles"
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE
    )
    cantidad = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"
