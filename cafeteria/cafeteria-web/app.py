from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    Response
)

from flask import flash

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
    if session.get("rol") != "administrador":
        session.clear()
        return redirect(url_for("index"))

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

    nombre = request.args.get("nombre")
    categoria = request.args.get("categoria")
    activo = request.args.get("activo")
    stock = request.args.get("stock")

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

        session["token"],

        nombre,

        categoria if categoria else None,

        activo if activo != "" else None,

        stock if stock else None

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

    respuesta = ApiService.eliminar_categoria(
        session["token"],
        id_categoria
    )

    if respuesta.status_code == 200:

        flash(
            "Categoría eliminada correctamente.",
            "success"
        )

    else:

        flash(
            respuesta.json()["detail"],
            "danger"
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

    if not datos:

        datos = {
            "usuarios":0,
            "productos":0,
            "categorias":0,
            "pedidos":0,
            "ventas":0,
            "poco_stock":0,
            "productos_vendidos":0
        }

    if datos.get("token_expirado"):

        session.clear()

        return redirect(url_for("index"))

    return render_template(

        "reportes.html",

        reporte=datos,

        usuario=session["usuario"],

        rol=session["rol"]

    )

@app.route("/reportes/productos")
@login_required
def reporte_productos():

    nombre = request.args.get("nombre")
    id_categoria = request.args.get("id_categoria")
    activo = request.args.get("activo")
    stock_minimo = request.args.get("stock_minimo")

    productos = ApiService.obtener_reporte_productos(

        session["token"],

        nombre,

        id_categoria,

        activo,

        stock_minimo

    )

    print(productos)

    categorias = ApiService.obtener_categorias(
        session["token"]
    )

    return render_template(

        "reporte_productos.html",

        productos=productos,

        categorias=categorias,

        usuario=session["usuario"],

        rol=session["rol"]

    )

@app.route("/reportes/pdf")
@login_required
def exportar_pdf():

    respuesta = ApiService.descargar_pdf(
        session["token"]
    )

    return Response(

        respuesta.content,

        mimetype="application/pdf",

        headers={
            "Content-Disposition":
            "attachment; filename=reporte.pdf"
        }

    )


@app.route("/reportes/excel")
@login_required
def exportar_excel():

    respuesta = ApiService.descargar_excel(
        session["token"]
    )

    return Response(

        respuesta.content,

        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        headers={
            "Content-Disposition":
            "attachment; filename=reporte.xlsx"
        }

    )

@app.route("/pedidos/<int:id_pedido>", methods=["GET","POST"])
@login_required
def detalle_pedido(id_pedido):

    error = None

    if request.method == "POST":

        # Cambiar estado
        if request.form.get("accion") == "estado":

            ApiService.cambiar_estado_pedido(

                session["token"],
                id_pedido,
                request.form["estado"]

            )

            return redirect(
                url_for(
                    "detalle_pedido",
                    id_pedido=id_pedido
                )
            )

        # Agregar producto
        elif request.form.get("accion") == "producto":

            datos = {

                "id_pedido": id_pedido,

                "id_producto": int(request.form["id_producto"]),

                "cantidad": int(request.form["cantidad"])

            }

            respuesta = ApiService.agregar_producto_pedido(

                session["token"],
                datos

            )

            if respuesta.status_code != 200:

                error = respuesta.text

            else:

                return redirect(
                    url_for(
                        "detalle_pedido",
                        id_pedido=id_pedido
                    )
                )

    detalle = ApiService.obtener_detalle_pedido(
        session["token"],
        id_pedido
    )

    productos = ApiService.obtener_productos(
        session["token"]
    )

    pedido = ApiService.obtener_pedido(
        session["token"],
        id_pedido
    )

    return render_template(
        "detalle_pedido.html",
        pedido=pedido,
        detalle=detalle,
        productos=productos,
        error=error
    )

@app.route("/categorias/editar/<int:id>", methods=["POST"])
@login_required
def editar_categoria(id):

    datos = {
        "nombre": request.form["nombre"],
        "descripcion": request.form["descripcion"]
    }

    ApiService.actualizar_categoria(
        session["token"],
        id,
        datos
    )

    return redirect(url_for("categorias"))

@app.route("/detalle/eliminar/<int:id_detalle>/<int:id_pedido>")
@login_required
def eliminar_detalle(id_detalle,id_pedido):

    ApiService.eliminar_detalle(
        session["token"],
        id_detalle
    )

    return redirect(
        url_for(
            "detalle_pedido",
            id_pedido=id_pedido
        )
    )

@app.route("/reportes/productos/pdf")
@login_required
def descargar_pdf_productos():

    params = request.args.to_dict()

    respuesta = ApiService.descargar_pdf_productos(
        session["token"],
        params
    )

    return Response(

        respuesta.content,

        mimetype="application/pdf",

        headers={

            "Content-Disposition":
            "attachment; filename=productos.pdf"

        }

    )

@app.route("/reportes/productos/excel")
@login_required
def descargar_excel_productos():

    params = request.args.to_dict()

    respuesta = ApiService.descargar_excel_productos(
        session["token"],
        params
    )

    return Response(

        respuesta.content,

        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        headers={

            "Content-Disposition":
            "attachment; filename=productos.xlsx"

        }

    )

@app.route("/reportes/pedidos")
@login_required
def reporte_pedidos():

    pedidos = ApiService.obtener_reporte_pedidos(

        session["token"],

        request.args.get("estado"),

        request.args.get("id_mesa"),

        request.args.get("fecha_inicio"),

        request.args.get("fecha_fin")

    )

    mesas = ApiService.obtener_mesas(
        session["token"]
    )

    return render_template(

        "reporte_pedidos.html",

        pedidos=pedidos,

        mesas=mesas,

        usuario=session["usuario"],

        rol=session["rol"]

    )

@app.route("/reportes/inventario")
@login_required
def reporte_inventario():

    inventario = ApiService.obtener_reporte_inventario(

        session["token"],

        request.args.get("categoria"),

        request.args.get("stock_bajo")

    )

    categorias = ApiService.obtener_categorias(
        session["token"]
    )

    return render_template(

        "reporte_inventario.html",

        inventario=inventario,

        categorias=categorias,

        usuario=session["usuario"],

        rol=session["rol"]

    )

@app.route("/reportes/pedidos/pdf")
@login_required
def descargar_pdf_pedidos():

    params = request.args.to_dict()

    respuesta = ApiService.descargar_pdf_pedidos(
        session["token"],
        params
    )

    return Response(

        respuesta.content,

        mimetype="application/pdf",

        headers={
            "Content-Disposition":
            "attachment; filename=pedidos.pdf"
        }

    )


@app.route("/reportes/pedidos/excel")
@login_required
def descargar_excel_pedidos():

    params = request.args.to_dict()

    respuesta = ApiService.descargar_excel_pedidos(
        session["token"],
        params
    )

    return Response(

        respuesta.content,

        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        headers={
            "Content-Disposition":
            "attachment; filename=pedidos.xlsx"
        }

    )

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)

    