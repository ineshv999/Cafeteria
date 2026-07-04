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

    correo = request.form["correo"]
    password = request.form["password"]

    respuesta = ApiService.login(
        correo,
        password
    )

    if respuesta is None:

        return render_template(
            "login.html",
            error="No se pudo conectar con la API."
        )

    if respuesta.status_code != 200:

        return render_template(
            "login.html",
            error="Correo o contraseña incorrectos."
        )

    datos = respuesta.json()

    session["token"] = datos["access_token"]

    return redirect(
        url_for("dashboard")
    )


@app.route("/dashboard")
def dashboard():

    if "token" not in session:
        return redirect(url_for("index"))

    return render_template(
        "dashboard.html"
    )


@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)