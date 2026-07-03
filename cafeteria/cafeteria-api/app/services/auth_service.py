from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.auth.security import verify_password
from app.auth.jwt import crear_token


class AuthService:

    @staticmethod
    def login(db: Session, email: str, password: str):

        usuario = (
            db.query(Usuario)
            .filter(Usuario.email == email)
            .first()
        )

        if not usuario:
            return None

        if not verify_password(
            password,
            usuario.password_hash
        ):
            return None

        token = crear_token(
            {
                "sub": usuario.email,
                "id": usuario.id_usuario,
                "rol": usuario.rol.nombre
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "usuario": usuario.nombre_completo,
            "rol": usuario.rol.nombre
        }