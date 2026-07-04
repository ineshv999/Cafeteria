import requests

from config import Config


class ApiService:

    @staticmethod
    def login(correo, password):

        try:

            response = requests.post(
                f"{Config.API_URL}/auth/login",
                json={
                    "correo": correo,
                    "password": password
                }
            )

            return response

        except Exception:
            return None