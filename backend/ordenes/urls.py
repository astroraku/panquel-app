from django.urls import path
from .views import login_view
from .views import lista_productos
from .views import lista_usuarios
from .views import historial_pedidos
from .views import last
from .views import crear_orden_columna
from .views import crear_proveedor
from .views import crear_producto
from .views import despertar_modelo
from . import views

urlpatterns = [
    path("login/", views.login_view),
    path("ia/wake/", views.wake_model),
    path("ia/predict/", views.predict_order),
    path("producto/", views.lista_productos),
    path("proveedores/", views.lista_proveedores),
    path("usuario-actual/", views.usuario_actual),
    path("usuarios/", views.lista_usuarios),
    path("usuarios/crear/", views.crear_usuario),
    path("usuarios/admin/<int:id>/", views.hacer_admin),
    path("usuarios/quitar-admin/<int:id>/", views.quitar_admin),
    path("usuarios/eliminar/<int:id>/", views.eliminar_usuario),
    path("dashboard/", views.dashboard_stats),
    path("historial/", views.historial_pedidos),
    path("ultima-orden/", views.last),   # Usando views.
    path("orden/crear-columna/", views.crear_orden_columna),
    path("proveedores/crear/", views.crear_proveedor),
    path("producto/crear/", views.crear_producto),
    path("producto/<int:id>/", views.producto_detalle),
    path("ia/despertar/", views.despertar_modelo),
    path("prediccion/guardar/", views.guardar_prediccion),
    path("prediccion/limpiar/", views.limpiar_prediccion),
    path("prediccion/actual/", views.prediccion_actual),
    path('api/cerrar-backend/', views.cerrar_backend, name='cerrar_backend'),
]

