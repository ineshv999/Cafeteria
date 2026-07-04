from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session
)

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


@app.route("/dashboard")
def dashboard():

    if "token" not in session:
        return redirect(url_for("index"))

    estadisticas = ApiService.dashboard(session["token"])

    if estadisticas is None:
        return "Error al obtener las estadísticas de la API."

    return render_template(
        "dashboard.html",
        estadisticas=estadisticas
    )


@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)