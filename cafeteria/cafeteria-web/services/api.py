import requests

from config import Config


class ApiService:

    @staticmethod
    def login(username, password):

        try:

            response = requests.post(
                f"{Config.API_URL}/auth/login",
                headers={
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data={
                    "grant_type": "password",
                    "username": username,
                    "password": password
                }
            )

            print("STATUS:", response.status_code)
            print("RESPUESTA:", response.text)

            return response

        except requests.exceptions.ConnectionError:

            return None
        
    @staticmethod
    def dashboard(token):

        response = requests.get(

            f"{Config.API_URL}/estadisticas/",

            headers={

                "Authorization":
                f"Bearer {token}"

            }

        )

        if response.status_code != 200:
            return None

        return response.json()
    
    @staticmethod
    def crear_usuario(token, datos):

        try:

            response = requests.post(

                f"{Config.API_URL}/usuarios/",

                json=datos,

                headers={

                    "Authorization": f"Bearer {token}"

                }

            )

            print(response.status_code)
            print(response.text)

            return response

        except requests.exceptions.ConnectionError:

            return None
        
    @staticmethod
    def obtener_usuarios(token):

        response = requests.get(
            f"{Config.API_URL}/usuarios/",
            headers={
                "Authorization": f"Bearer {token}"
            }
        )

        if response.status_code == 200:
            return response.json()

        return []


    @staticmethod
    def eliminar_usuario(token, id_usuario):

        return requests.delete(
            f"{Config.API_URL}/usuarios/{id_usuario}",
            headers={
                "Authorization": f"Bearer {token}"
            }
        )
    
    @staticmethod
    def obtener_productos(token):

        response = requests.get(

            f"{Config.API_URL}/productos/",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )

        if response.status_code != 200:
            return []

        return response.json()
    
    @staticmethod
    def crear_producto(token, datos, imagen):

        files = {

            "imagen": (

                imagen.filename,

                imagen.stream,

                imagen.mimetype

            )

        }

        response = requests.post(

            f"{Config.API_URL}/productos/",

            headers={

                "Authorization": f"Bearer {token}"

            },

            data=datos,

            files=files

        )

        return response
    
    @staticmethod
    def eliminar_producto(token, id_producto):

        return requests.delete(

            f"{Config.API_URL}/productos/{id_producto}",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )
    
    @staticmethod
    def obtener_categorias(token):

        response = requests.get(

            f"{Config.API_URL}/categorias/",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )

        if response.status_code != 200:
            return []

        return response.json()
    
    @staticmethod
    def crear_categoria(token, datos):

        return requests.post(

            f"{Config.API_URL}/categorias/",

            json=datos,

            headers={
                "Authorization": f"Bearer {token}"
            }

        )


    @staticmethod
    def eliminar_categoria(token, id_categoria):

        return requests.delete(

            f"{Config.API_URL}/categorias/{id_categoria}",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )
    
    @staticmethod
    def obtener_pedidos(token):

        response = requests.get(
            f"{Config.API_URL}/pedidos/",
            headers={
                "Authorization": f"Bearer {token}"
            }
        )

        if response.status_code != 200:
            return []

        return response.json()
    
    @staticmethod
    def obtener_pedido(token, id_pedido):

        response = requests.get(

            f"{Config.API_URL}/pedidos/{id_pedido}",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )

        if response.status_code != 200:
            return None

        return response.json()


    @staticmethod
    def crear_pedido(token, datos):

        return requests.post(
            f"{Config.API_URL}/pedidos/",
            json=datos,
            headers={
                "Authorization": f"Bearer {token}"
            }
        )


    @staticmethod
    def eliminar_pedido(token, id_pedido):

        return requests.delete(
            f"{Config.API_URL}/pedidos/{id_pedido}",
            headers={
                "Authorization": f"Bearer {token}"
            }
        )
    
    @staticmethod
    def obtener_dashboard(token):

        response = requests.get(

            f"{Config.API_URL}/dashboard/",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )

        if response.status_code != 200:
            return None

        return response.json()
    
    @staticmethod
    def obtener_usuario(token, id_usuario):

        response = requests.get(
            f"{Config.API_URL}/usuarios/{id_usuario}",
            headers={
                "Authorization": f"Bearer {token}"
            }
        )

        if response.status_code != 200:
            return None

        return response.json()


    @staticmethod
    def actualizar_usuario(token, id_usuario, datos):

        return requests.put(
            f"{Config.API_URL}/usuarios/{id_usuario}",
            json=datos,
            headers={
                "Authorization": f"Bearer {token}"
            }
        )
    
    @staticmethod
    def obtener_producto(token, id_producto):

        response = requests.get(
            f"{Config.API_URL}/productos/{id_producto}",
            headers={
                "Authorization": f"Bearer {token}"
            }
        )

        if response.status_code != 200:
            return None

        return response.json()


    @staticmethod
    def actualizar_producto(token, id_producto, datos, imagen=None):

        headers = {
            "Authorization": f"Bearer {token}"
        }

        if imagen and imagen.filename:

            files = {
                "imagen": (
                    imagen.filename,
                    imagen.stream,
                    imagen.content_type
                )
            }

            response = requests.put(
                f"{Config.API_URL}/productos/{id_producto}",
                headers=headers,
                data=datos,
                files=files
            )

        else:

            response = requests.put(
                f"{Config.API_URL}/productos/{id_producto}",
                headers=headers,
                data=datos
            )

        return response
    
    @staticmethod
    def obtener_reportes(token):

        response = requests.get(

            f"{Config.API_URL}/reportes/",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )

        if response.status_code != 200:
            return None

        return response.json()
    
    @staticmethod
    def obtener_detalle_pedido(token, id_pedido):

        response = requests.get(

            f"{Config.API_URL}/detalle-pedido/pedido/{id_pedido}",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )

        if response.status_code != 200:
            return []

        return response.json()


    @staticmethod
    def agregar_producto_pedido(token, datos):

        return requests.post(

            f"{Config.API_URL}/detalle-pedido/",

            json=datos,

            headers={
                "Authorization": f"Bearer {token}"
            }

        )


    @staticmethod
    def eliminar_detalle(token, id_detalle):

        return requests.delete(

            f"{Config.API_URL}/detalle-pedido/{id_detalle}",

            headers={
                "Authorization": f"Bearer {token}"
            }

        )
    
    @staticmethod
    def cambiar_estado_pedido(token, id_pedido, estado):

        return requests.put(

            f"{Config.API_URL}/pedidos/{id_pedido}/estado",

            json={
                "estado": estado
            },

            headers={
                "Authorization": f"Bearer {token}"
            }

        )