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

        response = requests.post(

            f"{Config.API_URL}/usuarios/",

            json=datos,

            headers={

                "Authorization":
                f"Bearer {token}"

            }

        )

        return response