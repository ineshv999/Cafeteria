from sqlalchemy.orm import Session
from app.auth.security import hash_password

from app.models.usuario import Usuario

class UsuarioService:

    @staticmethod
    def listar(db: Session):
        return db.query(Usuario).all()

    @staticmethod
    def obtener(db: Session, id_usuario: int):
        return db.query(Usuario).filter(
            Usuario.id_usuario == id_usuario
        ).first()

    @staticmethod
    def crear(db: Session, datos):

        usuario = Usuario(
            nombre_completo=datos.nombre_completo,
            email=datos.email,
            password_hash=hash_password(datos.password),
            id_rol=datos.id_rol
        )

        db.add(usuario)
        db.commit()
        db.refresh(usuario)

        return usuario

    @staticmethod
    def eliminar(db: Session, id_usuario: int):

        usuario = UsuarioService.obtener(db, id_usuario)

        if usuario:
            db.delete(usuario)
            db.commit()

        return usuario

    @staticmethod
    def actualizar(
        db: Session,
        id_usuario: int,
        datos
    ):

        usuario = (
            db.query(Usuario)
            .filter(
                Usuario.id_usuario == id_usuario
            )
            .first()
        )

        if not usuario:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado."
            )

        usuario.nombre_completo = datos.nombre_completo
        usuario.email = datos.email
        usuario.id_rol = datos.id_rol
        usuario.activo = datos.activo

        if datos.password:
            usuario.password_hash = bcrypt.hashpw(
                datos.password.encode(),
                bcrypt.gensalt()
            ).decode()

        db.commit()
        db.refresh(usuario)

        return usuario