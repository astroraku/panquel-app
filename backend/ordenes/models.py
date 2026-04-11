from django.db import models


class EstadoPrediccion(models.Model):
    activa = models.BooleanField(default=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ordenes_estadoprediccion'

class Prediccion(models.Model):
    # Relación con el estado
    estado = models.ForeignKey(EstadoPrediccion, on_delete=models.CASCADE, db_column='estado_id')
    nombre = models.CharField(max_length=255)
    # Mapeamos 'cantidad' a 'valor_predicho'
    cantidad = models.IntegerField(db_column='valor_predicho', null=True, blank=True)
    # ⚠️ IMPORTANTE: Si tu tabla 'prediccion_org' NO tiene columna 'fecha', 
    # NO la pongas aquí como modelo.

    class Meta:
        db_table = 'prediccion_org'  # <--- ESTO DEBE COINCIDIR CON SUPABASE
        managed = False              # <--- AÑADE ESTO para que Django no intente controlarla

# ========================
# PROVEEDORES
# ========================
class Proveedor(models.Model):

    id = models.CharField(
        primary_key=True,
        max_length=10
    )

    name = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    class Meta:
        db_table = "proveedor"

    def __str__(self):
        return self.name


# ========================
# PRODUCTOS
# ========================
class Producto(models.Model):

    nombre = models.CharField(
        max_length=100,
        primary_key=True
    )

    cantidad = models.IntegerField()

    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.CASCADE,
        db_column="proveedor_id"
    )

    class Meta:
        db_table = "producto"


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

# ========================
# PREDICCION (ORDEN ACTIVA)
# ========================
class Prediccion(models.Model):
    nombre = models.CharField(max_length=255)
    valor_predicho = models.IntegerField()
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "prediccion"

    def __str__(self):
        return f"{self.nombre} - {self.valor_predicho}"