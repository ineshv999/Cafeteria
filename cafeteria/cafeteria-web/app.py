from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session
)

from flask import send_file
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors

from openpyxl import Workbook

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

    estadisticas = ApiService.obtener_dashboard(
        session["token"]
    )

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

@app.route("/usuarios/editar/<int:id>", methods=["GET","POST"])
@login_required
def editar_usuario(id):

    if request.method == "POST":

        datos = {

            "nombre_completo": request.form["nombre_completo"],
            "email": request.form["email"],
            "id_rol": int(request.form["id_rol"]),
            "activo": request.form.get("activo") == "true",
            "password": request.form["password"]

        }

        ApiService.actualizar_usuario(
            session["token"],
            id,
            datos
        )

        return redirect(url_for("usuarios"))

    usuario = ApiService.obtener_usuario(
        session["token"],
        id
    )

    return render_template(
        "editar_usuario.html",
        usuario_editar=usuario
    )

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

@app.route("/productos/editar/<int:id_producto>", methods=["GET", "POST"])
@login_required
def editar_producto(id_producto):

    if request.method == "POST":

        # Obtener el producto actual
        producto = ApiService.obtener_producto(
            session["token"],
            id_producto
        )

        imagen = request.files.get("imagen")

        datos = {

            "nombre": request.form["nombre"],
            "descripcion": request.form["descripcion"],
            "precio": request.form["precio"],
            "stock": request.form["stock"],
            "activo": request.form["activo"],
            "id_categoria": request.form["id_categoria"]

        }

        ApiService.actualizar_producto(
            session["token"],
            id_producto,
            datos,
            imagen
        )

        return redirect(url_for("productos"))

    producto = ApiService.obtener_producto(
        session["token"],
        id_producto
    )

    categorias = ApiService.obtener_categorias(
        session["token"]
    )

    return render_template(
        "editar_producto.html",
        producto=producto,
        categorias=categorias
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

@app.route("/pedidos", methods=["GET", "POST"])
@login_required
def pedidos():

    error = None

    if request.method == "POST":

        datos = {
            "id_mesa": int(request.form.get("id_mesa"))
        }

        respuesta = ApiService.crear_pedido(
            session["token"],
            datos
        )

        if respuesta.status_code != 200:
            error = respuesta.text
        else:
            return redirect(url_for("pedidos"))

    pedidos = ApiService.obtener_pedidos(
        session["token"]
    )

    return render_template(
        "pedidos.html",
        pedidos=pedidos,
        usuario=session["usuario"],
        rol=session["rol"],
        error=error
    )

@app.route("/pedidos/eliminar/<int:id_pedido>")
@login_required
def eliminar_pedido(id_pedido):

    ApiService.eliminar_pedido(
        session["token"],
        id_pedido
    )

    return redirect(url_for("pedidos"))

@app.route("/reportes")
@login_required
def reportes():

    datos = ApiService.obtener_reportes(
        session["token"]
    )

    return render_template(

        "reportes.html",

        reporte=datos,

        usuario=session["usuario"],

        rol=session["rol"]

    )

@app.route("/reportes/pdf")
@login_required
def exportar_pdf():

    datos = ApiService.obtener_reportes(
        session["token"]
    )

    archivo = "reporte_cafeteria.pdf"

    pdf = SimpleDocTemplate(archivo)

    tabla = [

        ["Concepto", "Cantidad"],

        ["Usuarios", datos["usuarios"]],

        ["Productos", datos["productos"]],

        ["Categorías", datos["categorias"]],

        ["Pedidos", datos["pedidos"]],

        ["Ventas", f"${datos['ventas']}"],

        ["Productos con poco stock", datos["poco_stock"]]

    ]

    t = Table(tabla)

    t.setStyle(

        TableStyle([

            ("BACKGROUND",(0,0),(-1,0),colors.darkblue),

            ("TEXTCOLOR",(0,0),(-1,0),colors.white),

            ("GRID",(0,0),(-1,-1),1,colors.black),

            ("BACKGROUND",(0,1),(-1,-1),colors.beige),

            ("BOTTOMPADDING",(0,0),(-1,0),12)

        ])

    )

    pdf.build([t])

    return send_file(
        archivo,
        as_attachment=True
    )

@app.route("/reportes/excel")
@login_required
def exportar_excel():

    datos = ApiService.obtener_reportes(
        session["token"]
    )

    wb = Workbook()

    ws = wb.active

    ws.title = "Reporte"

    ws.append(["Concepto", "Cantidad"])

    ws.append(["Usuarios", datos["usuarios"]])
    ws.append(["Productos", datos["productos"]])
    ws.append(["Categorías", datos["categorias"]])
    ws.append(["Pedidos", datos["pedidos"]])
    ws.append(["Ventas", datos["ventas"]])
    ws.append(["Productos con poco stock", datos["poco_stock"]])

    archivo = "reporte_cafeteria.xlsx"

    wb.save(archivo)

    return send_file(
        archivo,
        as_attachment=True
    )

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)

    