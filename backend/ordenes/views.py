import json
import requests
from datetime import datetime, timedelta
from collections import defaultdict

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import connection
from django.db.models import Sum, Count
from django.utils import timezone

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import signal
import os
import signal
import threading
import time
from rest_framework.response import Response
from rest_framework.decorators import api_view
# 🔥 IMPORTACIÓN CONSOLIDADA (Evita el error de registro doble)
from .models import Producto, Proveedor, Prediccion, EstadoPrediccion, Orden, DetalleOrden

# 🔵 URL DEL MODELO IA EN RENDER
MODEL_URL = "https://modelo-narx-panquel-v2.onrender.com"




@api_view(['GET'])
def cerrar_backend(request):
    try:
        response = Response({"mensaje": "Cerrando servidor..."}, status=200)

        def kill_server():
            time.sleep(0.5)
            os.kill(os.getpid(), signal.SIGTERM)  # 🔥 más limpio que _exit

        threading.Thread(target=kill_server).start()

        return response

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def prediccion_actual(request):
    try:
        with connection.cursor() as cursor:
            # 1. Buscamos primero la orden activa
            cursor.execute("SELECT id, fecha FROM ordenes_estadoprediccion WHERE activa = true LIMIT 1")
            row = cursor.fetchone()

            if not row:
                return Response({"activa": False, "productos": []})

            estado_id = row[0]
            fecha_db = row[1]

            # 2. 🔥 ESTO ES LO QUE FALTABA: Traer los productos de prediccion_org
            # Buscamos los productos que pertenecen a ese estado_id
            cursor.execute("""
                SELECT nombre, valor_predicho 
                FROM prediccion_org 
                WHERE estado_id = %s
            """, [estado_id])
            
            rows_productos = cursor.fetchall()

            # Convertimos los resultados en una lista de diccionarios para el Front
            lista_productos = []
            for rp in rows_productos:
                lista_productos.append({
                    "nombre": rp[0],
                    "valor_predicho": rp[1]
                })

            return Response({
                "activa": True,
                "fecha": fecha_db,
                "productos": lista_productos  # <--- Ahora sí enviamos la data real
            })
            
    except Exception as e:
        print(f"Error en prediccion_actual: {str(e)}")
        return Response({"error": str(e)}, status=500)
# POST: limpiar predicción activa
@api_view(["POST"])
def limpiar_prediccion(request):
    try:
        estado = EstadoPrediccion.objects.filter(activa=True).first()
        if estado:
            estado.activa = False
            estado.save()

        return Response({"mensaje": "Predicción finalizada"}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

# POST: guardar predicción nueva
from django.db import connection # Asegúrate de tener esta importación arriba

@api_view(["POST"])
def guardar_prediccion(request):
    try:
        data = request.data
        productos = data.get("productos", [])

        with connection.cursor() as cursor:
            # --- PASO A: LIMPIEZA TOTAL ---
            # 1. Borramos TODOS los productos de la tabla temporal de predicción
            cursor.execute("DELETE FROM prediccion_org")
            
            # 2. Marcamos TODAS las órdenes de estado anteriores como inactivas
            cursor.execute("UPDATE ordenes_estadoprediccion SET activa = false")
            
            # --- PASO B: CREAR NUEVA INSTANCIA ---
            # 3. Creamos el nuevo estado activo (usamos SQL para evitar el warning de registro)
            cursor.execute(
                "INSERT INTO ordenes_estadoprediccion (activa, fecha) VALUES (true, NOW()) RETURNING id"
            )
            # Obtenemos el ID del estado que acabamos de crear
            nuevo_estado_id = cursor.fetchone()[0]

            # 4. Insertar los productos que vienen del Front
            for p in productos:
                nombre = str(p.get("nombre", "")).strip()
                try:
                    valor = int(float(p.get("cantidad", 0)))
                except (ValueError, TypeError):
                    valor = 0

                # Solo guardamos productos que tengan nombre y una cantidad mayor a 0
                if nombre and valor > 0:
                    cursor.execute(
                        """
                        INSERT INTO prediccion_org (nombre, valor_predicho, estado_id)
                        VALUES (%s, %s, %s)
                        """,
                        [nombre, valor, nuevo_estado_id]
                    )

        return Response({"ok": True, "mensaje": "Base de datos limpia y actualizada"}, status=201)

    except Exception as e:
        print(f"Error: {str(e)}")
        return Response({"ok": False, "error": str(e)}, status=500)

# ===============================
# 🤖 GENERAR PREDICCIÓN IA
# ===============================
@api_view(["GET"])
def predict_order(request):

    params = {
        "top": 0,
    }

    try:
        r = requests.get(
            f"{MODEL_URL}/predict-db",
            params=params,
            timeout=900
        )

        r.raise_for_status()
        data = r.json()

        return Response(data)

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=500)



@api_view(["GET"])
def despertar_modelo(request):
    import requests

    try:
        r = requests.get("https://modelo-narx-panquel-v2.onrender.com/ping/", timeout=10)
        return Response({"status": "ok"})
    except:
        return Response({"status": "sleep"})

@csrf_exempt
def crear_producto(request):
    if request.method == "POST":
        data = json.loads(request.body)

        try:
            cantidad = int(data.get("cantidad"))
        except:
            return JsonResponse(
                {"error": "Cantidad debe ser número"},
                status=400
            )

        try:
            proveedor = Proveedor.objects.get(id=data["proveedor_id"])
        except Proveedor.DoesNotExist:
            return JsonResponse({"error": "Proveedor inválido"}, status=400)

        prod = Producto.objects.create(
            nombre=data["nombre"],
            cantidad=cantidad,
            proveedor=proveedor
        )

        return JsonResponse({"nombre": prod.nombre})

@csrf_exempt
def producto_detalle(request, id):
    try:
        prod = Producto.objects.get(id=id)
    except Producto.DoesNotExist:
        return JsonResponse({"error": "No existe"}, status=404)

    if request.method == "PUT":
        try:
            data = json.loads(request.body)
        except:
            return JsonResponse({"error": "JSON inválido"}, status=400)

        # 🔥 VALIDACIÓN DE CANTIDAD
        try:
            cantidad = int(data.get("cantidad"))
        except:
            return JsonResponse(
                {"error": "Cantidad debe ser un número"},
                status=400
            )

        # 🔥 ACTUALIZACIÓN SEGURA
        prod.nombre = data.get("nombre")
        prod.cantidad = cantidad
        prod.proveedor_id = data.get("proveedor_id")
        prod.save()

        return JsonResponse({"status": "ok"})

    elif request.method == "DELETE":
        prod.delete()
        return JsonResponse({"ok": True})

    return JsonResponse({"error": "Método no permitido"}, status=405)

@csrf_exempt
def crear_proveedor(request):
    if request.method == "POST":
        data = json.loads(request.body)

        proveedor = Proveedor.objects.create(
            name=data.get("nombre"),
            telephone=data.get("telefono"),
            email=data.get("email"),
        )

        return JsonResponse({
            "id": proveedor.id,
            "name": proveedor.name,
            "telephone": proveedor.telephone,
            "email": proveedor.email,
        })
    
@api_view(["POST"])
def crear_orden_columna(request):
    productos = request.data.get("productos", [])

    if not productos:
        return Response({"error": "No hay productos"}, status=400)

    fecha = datetime.now().strftime("%d-%b-%y")

    with connection.cursor() as cursor:
        # 🔥 1. Crear columna nueva
        try:
            cursor.execute(f'ALTER TABLE pedido ADD COLUMN "{fecha}" INTEGER DEFAULT 0')
        except Exception as e:
            return Response({"error": f"La columna ya existe: {str(e)}"}, status=400)

        # 🔥 2. Actualizar cantidades
        for p in productos:
            nombre = p.get("nombre")
            cantidad = int(p.get("cantidad", 0))

            if cantidad > 0:
                cursor.execute(f'''
                    UPDATE pedido
                    SET "{fecha}" = %s
                    WHERE producto_nombre = %s
                ''', [cantidad, nombre])

    return Response({
        "mensaje": "Orden guardada correctamente",
        "fecha": fecha
    })

@api_view(["GET"])
def last(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM pedido")
        columnas = [col[0] for col in cursor.description]
        filas = cursor.fetchall()

    columnas_fecha = [c for c in columnas if "-" in c and c[0].isdigit()]
    
    if not columnas_fecha:
        return JsonResponse({"error": "No hay columnas de fecha"}, status=404)

    ultima_fecha = columnas_fecha[-1]
    
    items_para_frontend = []
    proveedores_set = set()  # 🔥 NUEVO

    for idx, fila in enumerate(filas):
        registro = dict(zip(columnas, fila))
        valor = registro.get(ultima_fecha)

        if valor and int(valor) > 0:
            nombre_prod = registro.get("producto_nombre")
            proveedor_id = registro.get("proveedor_id")  # 🔥 USAMOS ID

            # 🔥 GUARDAR PROVEEDOR GLOBAL
            if proveedor_id:
                proveedores_set.add(str(proveedor_id).strip())

            nombre_proveedor = registro.get("name")
            
            items_para_frontend.append({
                "id": idx,
                "nombre": nombre_prod,
                "proveedor_id": proveedor_id,
                "proveedor_nombre": nombre_proveedor,  # 🔥 NUEVO
                "cantidad": int(valor)
            })

    if not items_para_frontend:
        return JsonResponse({
            "id": "Sin datos",
            "fecha": ultima_fecha,
            "proveedores": [],
            "items": []
        })

    return JsonResponse({
        "id": ultima_fecha,
        "fecha": ultima_fecha,
        "proveedores": list(proveedores_set),  # 🔥 LISTA DE IDS
        "items": items_para_frontend
    }, safe=False)


from django.http import JsonResponse
from django.db import connection
from datetime import datetime

def historial_pedidos(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM pedido")
            columnas = [col[0] for col in cursor.description]
            filas = cursor.fetchall()

        pedidos = {}

        # ================== AGRUPAR DATOS ==================
        for fila in filas:
            registro = dict(zip(columnas, fila))

            producto = registro.get("producto_nombre")
            proveedor_id = registro.get("proveedor_id")

            for col, valor in registro.items():

                # Detectar columnas de fecha tipo "23-Jan-25"
                if col and "-" in col and col[0].isdigit():

                    try:
                        cantidad = int(valor) if valor else 0
                    except:
                        cantidad = 0

                    if cantidad > 0:

                        if col not in pedidos:
                            pedidos[col] = {
                                "proveedores": set(),
                                "fecha": col,
                                "productos": []
                            }

                        if proveedor_id:
                            pedidos[col]["proveedores"].add(str(proveedor_id).strip())

                        pedidos[col]["productos"].append({
                            "nombre": producto,
                            "cantidad": cantidad
                        })

        # ================== PARSE FECHA CORRECTO ==================
        def parse_fecha(fecha_str):
            try:
                # Ejemplo: 23-Jan-25
                return datetime.strptime(fecha_str.strip(), "%d-%b-%y")
            except Exception as e:
                print("ERROR FECHA:", fecha_str, e)
                # 🔥 MUY IMPORTANTE: fallback antiguo, NO datetime.now()
                return datetime(1900, 1, 1)

        # ================== ORDENAR POR FECHA ==================
        # Más antiguo → más nuevo
        fechas_ordenadas = sorted(
            pedidos.keys(),
            key=lambda f: parse_fecha(f)
        )

        # ================== GENERAR CÓDIGOS ==================
        resultado = []

        for i, fecha in enumerate(fechas_ordenadas, start=1):
            pedido = pedidos[fecha]

            resultado.append({
                "codigo": f"PED-{i:03}",
                "fecha": fecha,
                "proveedores": list(pedido["proveedores"]),
                "productos": pedido["productos"]
            })

        return JsonResponse(resultado, safe=False)

    except Exception as e:
        with open("error_log.txt", "a") as f:
            f.write(f"ERROR HISTORIAL: {str(e)}\n")

        return JsonResponse({"error": str(e)}, status=500)




def dashboard_stats(request):

    def parse_fecha(col):
        try:
            return datetime.strptime(col, "%Y-%m-%d")
        except:
            try:
                return datetime.strptime(col, "%d-%b-%y")
            except:
                return None

    total_productos = Producto.objects.count()
    total_proveedores = Proveedor.objects.count()

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM pedido")
        columnas = [col[0] for col in cursor.description]
        filas = cursor.fetchall()

    total_ordenes = 0
    consumo_semanal = 0
    productos_totales = defaultdict(int)
    proveedores_contador = defaultdict(int)

    hoy = datetime.now()
    hace_7_dias = hoy - timedelta(days=7)
    inicio_mes = hoy.replace(day=1)

    # =========================
    # 🔥 LOOP PRINCIPAL
    # =========================
    for fila in filas:
        registro = dict(zip(columnas, fila))

        producto = registro.get("producto_nombre")
        proveedor = registro.get("name")

        for col, valor in registro.items():

            if col and "-" in col and col[0].isdigit():

                try:
                    cantidad = int(valor) if valor else 0
                except:
                    cantidad = 0

                if cantidad > 0:

                    fecha = parse_fecha(col)
                    if not fecha:
                        continue

                    total_ordenes += 1
                    productos_totales[producto] += cantidad
                    proveedores_contador[proveedor] += cantidad

                    if fecha >= hace_7_dias:
                        consumo_semanal += cantidad

    # 🔥 proveedor más usado
    proveedor_mas_usado = (
        max(proveedores_contador, key=proveedores_contador.get)
        if proveedores_contador else "N/A"
    )

    # 🔥 producto más pedido
    producto_mas_pedido = (
        max(productos_totales, key=productos_totales.get)
        if productos_totales else "N/A"
    )

    # menos
    # ❄️ producto menos vendido
    producto_menos_vendido = "N/A"
    productos_filtrados = {k: v for k, v in productos_totales.items() if v > 0}

    if productos_filtrados:
        producto_menos_vendido = min(productos_filtrados, key=productos_filtrados.get)


    # 🧊 proveedor menos usado
    proveedor_menos_usado = "N/A"
    proveedores_filtrados = {k: v for k, v in proveedores_contador.items() if v > 0}

    if proveedores_filtrados:
        proveedor_menos_usado = min(proveedores_filtrados, key=proveedores_filtrados.get)

    # =========================
    # 🔥 TOP PRODUCTO DEL MES
    # =========================
    top_producto_mes = "N/A"
    productos_mes = defaultdict(int)

    for fila in filas:
        registro = dict(zip(columnas, fila))
        producto = registro.get("producto_nombre")

        for col, valor in registro.items():

            if col and "-" in col and col[0].isdigit():

                try:
                    cantidad = int(valor) if valor else 0
                except:
                    cantidad = 0

                if cantidad > 0:

                    fecha = parse_fecha(col)
                    if not fecha:
                        continue

                    if fecha >= inicio_mes:
                        productos_mes[producto] += cantidad

    if productos_mes:
        top_producto_mes = max(productos_mes, key=productos_mes.get)

    return JsonResponse({
        "totalProductos": total_productos,
        "totalProveedores": total_proveedores,
        "totalOrdenes": total_ordenes,

        "proveedorMasUsado": proveedor_mas_usado,
        "proveedorMenosUsado": proveedor_menos_usado,  # 🆕

        "productoMasPedido": producto_mas_pedido,
        "productoMenosVendido": producto_menos_vendido,  # 🆕

        "consumoSemanal": consumo_semanal,
        "topProductoMes": top_producto_mes
    })

def usuario_actual(request):

    if not request.user.is_authenticated:
        return JsonResponse({"username": None, "rol": "usuario"})

    return JsonResponse({
        "username": request.user.username,
        "rol": "admin" if request.user.is_superuser else "usuario"
    })


def lista_usuarios(request):

    usuarios = User.objects.values(
        "id",
        "username",
        "is_superuser"
    )

    data = [
        {
            "id": u["id"],
            "username": u["username"],
            "rol": "admin" if u["is_superuser"] else "usuario"
        }
        for u in usuarios
    ]

    return JsonResponse(data, safe=False)


@csrf_exempt
def crear_usuario(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")
        rol = data.get("rol")

        user = User.objects.create_user(
            username=username,
            password=password
        )

        if rol == "admin":
            user.is_staff = True
            user.save()

        return JsonResponse({
            "id": user.id,
            "username": user.username,
            "rol": rol
        })


@csrf_exempt
def hacer_admin(request, id):

    user = User.objects.get(id=id)
    user.is_superuser = True
    user.is_staff = True
    user.save()

    return JsonResponse({"status": "ok"})


@csrf_exempt
def quitar_admin(request, id):

    user = User.objects.get(id=id)
    user.is_superuser = False
    user.save()

    return JsonResponse({"status": "ok"})


@csrf_exempt
def eliminar_usuario(request, id):
    if request.method == "DELETE":
        user = User.objects.get(id=id)
        user.delete()
        return JsonResponse({"success": True})




def lista_productos(request):

    productos = Producto.objects.select_related("proveedor").values(
        "nombre",
        "cantidad",
        "proveedor_id",
        "proveedor__name"
    )

    data = [
        {
            "nombre": p["nombre"],
            "cantidad": p["cantidad"],
            "proveedor_id": p["proveedor_id"],
            "proveedor_nombre": p["proveedor__name"]
        }
        for p in productos
    ]

    return JsonResponse(data, safe=False)


def lista_proveedores(request):
    proveedores = Proveedor.objects.all().values(
        "id",
        "name",
        "telephone",
        "email"
    )

    return JsonResponse(list(proveedores), safe=False)

# ===============================
# 🔐 LOGIN
# ===============================
@csrf_exempt
def login_view(request):

    # 👉 RESPUESTA AL PREFLIGHT CORS
    if request.method == "OPTIONS":
        response = JsonResponse({"ok": True})
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "mensaje": "JSON inválido"},
                status=400
            )

        usuario = data.get("usuario")
        password = data.get("password")

        user = authenticate(username=usuario, password=password)

        if user is None:
            return JsonResponse({
                "success": False,
                "mensaje": "Credenciales incorrectas"
            }, status=401)

        # 🔐 TOKEN (si no existe, se crea)
        token, _ = Token.objects.get_or_create(user=user)

        # 👑 ROL NORMALIZADO
        rol = "admin" if user.is_superuser else "usuario"

        response = JsonResponse({
            "success": True,
            "mensaje": "Login correcto",
            "token": token.key,
            "rol": rol,
            "is_superuser": user.is_superuser,
            "username": user.username
        })


        return response

    return JsonResponse(
        {"error": "Método no permitido"},
        status=405
    )


# ===============================
# 🤖 DESPERTAR MODELO IA
# ===============================
@api_view(["GET"])
def wake_model(request):
    try:
        r = requests.get(f"{MODEL_URL}/", timeout=60)

        if r.status_code == 200:
            return Response({"status": "ready"})
        else:
            return Response({"status": "sleep"})

    except Exception:
        return Response({"status": "sleep"})

