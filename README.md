# Proyecto Panquel

Aplicación con frontend en React y backend en Django.

## Requisitos
- Node.js 18+
- Python 3.12+

## Frontend
```bash
npm install
npm run dev

cd backend
python -m venv venv
pip install -r requirements.txt
python manage.py runserver


# Proyecto Panquel

Aplicación con frontend en React y backend en Django.

---

## Requisitos

* Node.js 18+
* Python 3.12+
* npm (incluido con Node.js)
* pip (incluido con Python)

---

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/astroraku/panquel-app.git
cd panquel-app
```

---

## Django

```bash
cd backend

# Crea entorno virtual
python -m venv venv

# Activa entorno virtual (Windows)
venv\Scripts\activate

# Activar entorno virtual (Linux/Mac)
source venv/bin/activate

# Instala dependencias
pip install -r requirements.txt

# Migraciones
python manage.py migrate

# Crea superusuario (opcional)
python manage.py createsuperuser

# Ejecuta servidor
python manage.py runserver
```

El backend correrá en:
http://localhost:8000

---

## React

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar proyecto
npm run dev
```

El frontend correrá en:
http://localhost:5173

---

## Variables de entorno

Crea un archivo `.env` en la carpeta del frontend:

```env
VITE_API_URL=http://localhost:8000
```

---

## Conexión Frontend-Backend

Asegúrate de que el backend tenga habilitado CORS:

```python
# settings.py
CORS_ALLOW_ALL_ORIGINS = True
```


#

* El backend debe estar corriendo antes del frontend.
* Si hay errores de conexión, revisa la URL en el `.env`.
