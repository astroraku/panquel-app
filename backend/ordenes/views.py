from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
import json

@csrf_exempt
def login_view(request):

    # 👉 RESPUESTA AL PREFLIGHT CORS
    if request.method == "OPTIONS":
        response = JsonResponse({"ok": True})
        response["Access-Control-Allow-Origin"] = "*"
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

        # 🌍 CORS
        response["Access-Control-Allow-Origin"] = "*"

        return response

    return JsonResponse(
        {"error": "Método no permitido"},
        status=405
    )
