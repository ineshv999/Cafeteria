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
                "Authorization": f"Bearer {token}"
            }
        )

        print("=" * 50)
        print("STATUS:", response.status_code)
        print("HEADERS:", response.headers)
        print("BODY:")
        print(response.text)
        print("=" * 50)

        if response.status_code != 200:
            return None

        return response.json()