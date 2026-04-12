from django.db import models


class EstadoPrediccion(models.Model):
    activa = models.BooleanField(default=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'estadoprediccion'

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
    nombre = models.CharField(max_length=100, primary_key=True)

    cantidad = models.CharField(max_length=50)  # 🔥 CAMBIO AQUÍ

    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.CASCADE,
        db_column="proveedor_id"
    )

    class Meta:
        db_table = "producto"



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