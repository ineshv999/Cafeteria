from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session
)

from functools import wraps

from config import Config
from services.api import ApiService

app = Flask(__name__)
app.config.from_object(Config)


@app.route("/")
def index():

    if "token" in session:
        return redirect(url_for("dashboard"))

    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login():
    if "token" in session:
        return redirect(url_for("dashboard"))

    print("FORM:", request.form)

    username = request.form.get("username")
    if username is None:
        username = request.form.get("correo")

    password = request.form.get("password")

    if not username or not password:
        return render_template(
            "login.html",
            error="No llegaron los datos del formulario."
        )

    respuesta = ApiService.login(
        username,
        password
    )

    if respuesta is None:
        return render_template(
            "login.html",
            error="No se pudo conectar con la API."
        )

    print("STATUS:", respuesta.status_code)
    print("RESPUESTA:", respuesta.text)

    if respuesta.status_code != 200:
        return render_template(
            "login.html",
            error="Correo o contraseña incorrectos."
        )

    datos = respuesta.json()

    session["token"] = datos["access_token"]
    session["usuario"] = datos["usuario"]
    session["rol"] = datos["rol"]

    return redirect(url_for("dashboard"))

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        if "token" not in session:
            return redirect(url_for("login"))

        return f(*args, **kwargs)

    return decorated

@app.route("/dashboard")
@login_required
def dashboard():

    estadisticas = {
        "ganancias": 45230,
        "perdidas": 2150,
        "ordenes": 1840,

        "insumos":[
            {
                "producto":"Café Espresso",
                "descripcion":"Ventas óptimas",
                "monto":12400,
                "tipo":"plus"
            },
            {
                "producto":"Leche Caducada",
                "descripcion":"Desperdicio",
                "monto":450,
                "tipo":"minus"
            },
            {
                "producto":"Repostería",
                "descripcion":"No vendida",
                "monto":820,
                "tipo":"minus"
            }
        ]
    }

    return render_template(
        "dashboard.html",
        usuario=session["usuario"],
        rol=session["rol"],
        estadisticas=estadisticas
    )

@app.route("/estadisticas")
def estadisticas():

    if "token" not in session:
        return redirect(url_for("index"))

    estadisticas = ApiService.dashboard(
        session["token"]
    )

    return render_template(
        "estadisticas.html",
        estadisticas=estadisticas
    )

@app.route("/usuarios", methods=["GET", "POST"])
@login_required
def usuarios():
    error = None

    if request.method == "POST":

        nombre = request.form.get("nombre_completo")
        email = request.form.get("email")
        password = request.form.get("password")
        id_rol = int(request.form.get("id_rol"))

        print("Nuevo usuario:")
        print(nombre)
        print(email)
        print(password)
        print(id_rol)

        datos = {

            "nombre_completo": nombre,
            "email": email,
            "password": password,
            "id_rol": id_rol

        }

        respuesta = ApiService.crear_usuario(
            session["token"],
            datos
        )

        print(respuesta.status_code)
        print(respuesta.text)

        if respuesta is not None:

            if respuesta.status_code == 200:

                return redirect(url_for("usuarios"))

            error = respuesta.text

        else:

            error = "No se pudo conectar con la API."

    lista_usuarios = ApiService.obtener_usuarios(
        session["token"]
    )

    return render_template(
            "usuarios.html",
            usuarios=lista_usuarios,
            usuario=session["usuario"],
            rol=session["rol"],
            error=error
        )

@app.route("/usuarios/eliminar/<int:id>")
@login_required
def eliminar_usuario(id):

    ApiService.eliminar_usuario(
        session["token"],
        id
    )

    return redirect(url_for("usuarios"))

@app.route("/productos", methods=["GET", "POST"])
@login_required
def productos():

    error = None

    if request.method == "POST":

        datos = {

            "nombre": request.form["nombre"],
            "descripcion": request.form["descripcion"],
            "precio": request.form["precio"],
            "stock": request.form["stock"],
            "activo": request.form["activo"],
            "id_categoria": request.form["id_categoria"]

        }

        imagen = request.files["imagen"]

        respuesta = ApiService.crear_producto(

            session["token"],
            datos,
            imagen

        )

        if respuesta.status_code == 200:

            return redirect(url_for("productos"))

        error = respuesta.text

    productos = ApiService.obtener_productos(
        session["token"]
    )

    categorias = ApiService.obtener_categorias(
        session["token"]
    )

    return render_template(

        "productos.html",

        productos=productos,

        categorias=categorias,

        usuario=session["usuario"],

        rol=session["rol"],

        error=error

    )

@app.route("/productos/eliminar/<int:id_producto>")
@login_required
def eliminar_producto(id_producto):

    ApiService.eliminar_producto(

        session["token"],
        id_producto

    )

    return redirect(url_for("productos"))

@app.route("/categorias", methods=["GET", "POST"])
@login_required
def categorias():

    error = None

    if request.method == "POST":

        datos = {

            "nombre": request.form["nombre"],
            "descripcion": request.form["descripcion"]

        }

        respuesta = ApiService.crear_categoria(

            session["token"],
            datos

        )

        if respuesta.status_code == 200:

            return redirect(url_for("categorias"))

        error = respuesta.text

    categorias = ApiService.obtener_categorias(
        session["token"]
    )

    return render_template(

        "categorias.html",

        categorias=categorias,

        usuario=session["usuario"],

        rol=session["rol"],

        error=error

    )

@app.route("/categorias/eliminar/<int:id_categoria>")
@login_required
def eliminar_categoria(id_categoria):

    ApiService.eliminar_categoria(

        session["token"],
        id_categoria

    )

    return redirect(url_for("categorias"))

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)

    