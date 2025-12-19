from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
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

        if user is not None:
            return JsonResponse({
                "success": True,
                "mensaje": "Login correcto"
            })

        return JsonResponse({
            "success": False,
            "mensaje": "Credenciales incorrectas"
        }, status=401)

    return JsonResponse(
        {"error": "Método no permitido"},
        status=405
    )
