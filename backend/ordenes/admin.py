from django.contrib import admin
from .models import Proveedor, Producto, Orden, DetalleOrden

admin.site.register(Proveedor)
admin.site.register(Producto)
admin.site.register(Orden)
admin.site.register(DetalleOrden)
