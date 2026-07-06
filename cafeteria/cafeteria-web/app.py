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
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.units import inch, cm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
    from reportlab.lib.fonts import addMapping
    import os
    from datetime import datetime
    
    datos = ApiService.obtener_reportes(session["token"])
    
    # Crear nombre de archivo con fecha
    fecha_actual = datetime.now().strftime("%Y%m%d_%H%M%S")
    archivo = f"reporte_cafeteria_{fecha_actual}.pdf"
    
    # Crear el documento con márgenes
    pdf = SimpleDocTemplate(
        archivo,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Estilo para título principal
    titulo_style = ParagraphStyle(
        'TituloStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#6C3B2A'),
        alignment=TA_CENTER,
        spaceAfter=30,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para subtítulo
    subtitulo_style = ParagraphStyle(
        'SubtituloStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#5D4037'),
        alignment=TA_CENTER,
        spaceAfter=20,
        fontName='Helvetica'
    )
    
    # Estilo para fecha
    fecha_style = ParagraphStyle(
        'FechaStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#8D6E63'),
        alignment=TA_RIGHT,
        spaceAfter=20,
        fontName='Helvetica'
    )
    
    # Estilo para encabezados de tabla
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.white,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para celdas de datos
    data_style = ParagraphStyle(
        'DataStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#2D1B0F'),
        alignment=TA_LEFT,
        fontName='Helvetica'
    )
    
    # Estilo para valores monetarios
    money_style = ParagraphStyle(
        'MoneyStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#2E7D32'),
        alignment=TA_RIGHT,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para valores negativos (stock bajo)
    warning_style = ParagraphStyle(
        'WarningStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#C62828'),
        alignment=TA_LEFT,
        fontName='Helvetica-Bold'
    )
    
    # Elementos del PDF
    elementos = []
    
    # Logo o título principal
    elementos.append(Paragraph("☕ CoffeeAdmin", titulo_style))
    elementos.append(Paragraph("Reporte General del Sistema", subtitulo_style))
    elementos.append(Paragraph(f"Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", fecha_style))
    elementos.append(Spacer(1, 0.3*inch))
    
    # Línea decorativa
    linea_data = [
        ["", ""],
        ["", ""]
    ]
    linea_tabla = Table(linea_data, colWidths=[4*inch, 2*inch])
    linea_tabla.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,0), 2, colors.HexColor('#D4A574')),
        ('LINEABOVE', (0,1), (-1,1), 1, colors.HexColor('#D4A574')),
    ]))
    elementos.append(linea_tabla)
    elementos.append(Spacer(1, 0.2*inch))
    
    # Datos principales
    datos_tabla = [
        [
            Paragraph("📊 Concepto", header_style),
            Paragraph("📈 Cantidad", header_style)
        ],
        [
            Paragraph("👥 Usuarios", data_style),
            Paragraph(str(datos["usuarios"]), data_style)
        ],
        [
            Paragraph("📦 Productos", data_style),
            Paragraph(str(datos["productos"]), data_style)
        ],
        [
            Paragraph("🏷️ Categorías", data_style),
            Paragraph(str(datos["categorias"]), data_style)
        ],
        [
            Paragraph("📋 Pedidos", data_style),
            Paragraph(str(datos["pedidos"]), data_style)
        ],
        [
            Paragraph("💰 Ventas", data_style),
            Paragraph(f"${'{:,.2f}'.format(datos['ventas'])}", money_style)
        ],
        [
            Paragraph("⚠️ Productos con poco stock", warning_style),
            Paragraph(str(datos["poco_stock"]), warning_style)
        ]
    ]
    
    # Crear tabla con mejor estilo
    tabla = Table(datos_tabla, colWidths=[4*inch, 2*inch])
    tabla.setStyle(TableStyle([
        # Encabezado
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6C3B2A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('TOPPADDING', (0,0), (-1,0), 12),
        
        # Filas de datos (alternando colores)
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F8F5F0')),
        ('BACKGROUND', (0,2), (-1,2), colors.HexColor('#FFFFFF')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#F8F5F0')),
        ('BACKGROUND', (0,4), (-1,4), colors.HexColor('#FFFFFF')),
        ('BACKGROUND', (0,5), (-1,5), colors.HexColor('#F8F5F0')),
        ('BACKGROUND', (0,6), (-1,6), colors.HexColor('#FFFFFF')),
        
        # Bordes y espaciado
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#D4A574')),
        ('BOX', (0,0), (-1,-1), 2, colors.HexColor('#6C3B2A')),
        ('TOPPADDING', (0,1), (-1,-1), 8),
        ('BOTTOMPADDING', (0,1), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        
        # Alineación
        ('ALIGN', (0,1), (0,-1), 'LEFT'),
        ('ALIGN', (1,1), (1,-1), 'RIGHT'),
        
        # Estilo para la última fila (stock bajo)
        ('FONTNAME', (0,6), (1,6), 'Helvetica-Bold'),
    ]))
    
    elementos.append(tabla)
    elementos.append(Spacer(1, 0.3*inch))
    
    # Resumen adicional
    resumen_style = ParagraphStyle(
        'ResumenStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#5D4037'),
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    # Calcular algunos datos adicionales
    ticket_promedio = datos['ventas'] / datos['pedidos'] if datos['pedidos'] > 0 else 0
    stock_bajo_porcentaje = (datos['poco_stock'] / datos['productos'] * 100) if datos['productos'] > 0 else 0
    
    resumen = [
        f"📊 Ticket promedio: ${'{:,.2f}'.format(ticket_promedio)}",
        f"⚠️ {datos['poco_stock']} productos con stock bajo ({'{:.1f}'.format(stock_bajo_porcentaje)}% del total)",
        f"📦 {datos['productos']} productos en {datos['categorias']} categorías"
    ]
    
    for linea in resumen:
        elementos.append(Paragraph(linea, resumen_style))
        elementos.append(Spacer(1, 0.1*inch))
    
    elementos.append(Spacer(1, 0.3*inch))
    
    # Línea final
    linea_final_data = [[""]]
    linea_final = Table(linea_final_data, colWidths=[6*inch])
    linea_final.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,0), 1, colors.HexColor('#D4A574')),
    ]))
    elementos.append(linea_final)
    elementos.append(Spacer(1, 0.2*inch))
    
    # Pie de página
    pie_style = ParagraphStyle(
        'PieStyle',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#8D6E63'),
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    elementos.append(Paragraph("CoffeeAdmin - Sistema de Gestión para Cafeterías", pie_style))
    elementos.append(Paragraph(f"Reporte generado el {datetime.now().strftime('%d/%m/%Y')}", pie_style))
    
    # Construir el PDF
    pdf.build(elementos)
    
    return send_file(
        archivo,
        as_attachment=True,
        download_name=f"reporte_cafeteria_{fecha_actual}.pdf"
    )


@app.route("/reportes/excel")
@login_required
def exportar_excel():
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, numbers
    from openpyxl.utils import get_column_letter
    from datetime import datetime
    import os
    
    datos = ApiService.obtener_reportes(session["token"])
    
    # Crear nombre de archivo con fecha
    fecha_actual = datetime.now().strftime("%Y%m%d_%H%M%S")
    archivo = f"reporte_cafeteria_{fecha_actual}.xlsx"
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Reporte General"
    
    # Estilos
    header_font = Font(name='Arial', size=14, bold=True, color='FFFFFF')
    header_fill = PatternFill(start_color='6C3B2A', end_color='6C3B2A', fill_type='solid')
    header_alignment = Alignment(horizontal='center', vertical='center')
    
    subheader_font = Font(name='Arial', size=12, bold=True, color='5D4037')
    subheader_fill = PatternFill(start_color='F8F5F0', end_color='F8F5F0', fill_type='solid')
    
    data_font = Font(name='Arial', size=11)
    data_alignment = Alignment(horizontal='left', vertical='center')
    
    money_font = Font(name='Arial', size=11, bold=True, color='2E7D32')
    money_alignment = Alignment(horizontal='right', vertical='center')
    
    warning_font = Font(name='Arial', size=11, bold=True, color='C62828')
    
    border = Border(
        left=Side(style='thin', color='D4A574'),
        right=Side(style='thin', color='D4A574'),
        top=Side(style='thin', color='D4A574'),
        bottom=Side(style='thin', color='D4A574')
    )
    
    thick_border = Border(
        left=Side(style='medium', color='6C3B2A'),
        right=Side(style='medium', color='6C3B2A'),
        top=Side(style='medium', color='6C3B2A'),
        bottom=Side(style='medium', color='6C3B2A')
    )
    
    # Título
    ws.merge_cells('A1:B1')
    titulo_cell = ws['A1']
    titulo_cell.value = "☕ CoffeeAdmin - Reporte General"
    titulo_cell.font = Font(name='Arial', size=20, bold=True, color='6C3B2A')
    titulo_cell.alignment = Alignment(horizontal='center', vertical='center')
    
    # Fecha
    ws.merge_cells('A2:B2')
    fecha_cell = ws['A2']
    fecha_cell.value = f"Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}"
    fecha_cell.font = Font(name='Arial', size=10, color='8D6E63')
    fecha_cell.alignment = Alignment(horizontal='right', vertical='center')
    
    # Espacio
    ws.row_dimensions[3].height = 10
    
    # Encabezados de tabla
    headers = ["📊 Concepto", "📈 Cantidad"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = thick_border
    
    # Datos
    datos_lista = [
        ("👥 Usuarios", datos["usuarios"], 'normal'),
        ("📦 Productos", datos["productos"], 'normal'),
        ("🏷️ Categorías", datos["categorias"], 'normal'),
        ("📋 Pedidos", datos["pedidos"], 'normal'),
        ("💰 Ventas", f"${'{:,.2f}'.format(datos['ventas'])}", 'money'),
        ("⚠️ Productos con poco stock", datos["poco_stock"], 'warning')
    ]
    
    for idx, (concepto, valor, tipo) in enumerate(datos_lista, 5):
        # Concepto
        cell_concepto = ws.cell(row=idx, column=1)
        cell_concepto.value = concepto
        cell_concepto.font = Font(name='Arial', size=11, bold=True if tipo == 'warning' else False)
        cell_concepto.alignment = Alignment(horizontal='left', vertical='center')
        cell_concepto.border = border
        
        # Valor
        cell_valor = ws.cell(row=idx, column=2)
        cell_valor.value = valor
        cell_valor.alignment = Alignment(horizontal='right', vertical='center')
        cell_valor.border = border
        
        if tipo == 'money':
            cell_valor.font = money_font
        elif tipo == 'warning':
            cell_valor.font = warning_font
            cell_concepto.font = warning_font
        else:
            cell_valor.font = data_font
        
        # Color de fondo alternado
        if idx % 2 == 0:
            for col in range(1, 3):
                ws.cell(row=idx, column=col).fill = PatternFill(start_color='F8F5F0', end_color='F8F5F0', fill_type='solid')
    
    # Ajustar ancho de columnas
    ws.column_dimensions['A'].width = 30
    ws.column_dimensions['B'].width = 20
    
    # Agregar resumen
    fila_resumen = len(datos_lista) + 6
    
    # Calcular datos adicionales
    ticket_promedio = datos['ventas'] / datos['pedidos'] if datos['pedidos'] > 0 else 0
    stock_bajo_porcentaje = (datos['poco_stock'] / datos['productos'] * 100) if datos['productos'] > 0 else 0
    
    resumen_datos = [
        ("📊 Ticket promedio", f"${'{:,.2f}'.format(ticket_promedio)}"),
        ("⚠️ Productos con stock bajo", f"{datos['poco_stock']} ({'{:.1f}'.format(stock_bajo_porcentaje)}%)"),
        ("📦 Resumen", f"{datos['productos']} productos en {datos['categorias']} categorías")
    ]
    
    # Espacio
    ws.row_dimensions[fila_resumen - 1].height = 10
    
    for idx, (concepto, valor) in enumerate(resumen_datos, fila_resumen):
        cell_concepto = ws.cell(row=idx, column=1)
        cell_concepto.value = concepto
        cell_concepto.font = Font(name='Arial', size=11, bold=True, color='5D4037')
        cell_concepto.alignment = Alignment(horizontal='left', vertical='center')
        
        cell_valor = ws.cell(row=idx, column=2)
        cell_valor.value = valor
        cell_valor.font = Font(name='Arial', size=11, bold=True, color='5D4037')
        cell_valor.alignment = Alignment(horizontal='right', vertical='center')
    
    # Pie de página
    fila_pie = fila_resumen + len(resumen_datos) + 2
    
    ws.merge_cells(f'A{fila_pie}:B{fila_pie}')
    pie_cell = ws.cell(row=fila_pie, column=1)
    pie_cell.value = "CoffeeAdmin - Sistema de Gestión para Cafeterías"
    pie_cell.font = Font(name='Arial', size=9, color='8D6E63')
    pie_cell.alignment = Alignment(horizontal='center', vertical='center')
    
    ws.merge_cells(f'A{fila_pie + 1}:B{fila_pie + 1}')
    pie_fecha = ws.cell(row=fila_pie + 1, column=1)
    pie_fecha.value = f"Reporte generado el {datetime.now().strftime('%d/%m/%Y')}"
    pie_fecha.font = Font(name='Arial', size=9, color='8D6E63')
    pie_fecha.alignment = Alignment(horizontal='center', vertical='center')
    
    # Guardar
    wb.save(archivo)
    
    return send_file(
        archivo,
        as_attachment=True,
        download_name=f"reporte_cafeteria_{fecha_actual}.xlsx"
    )

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)

    