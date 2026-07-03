from fastapi import Depends, HTTPException

from app.auth.dependencies import obtener_usuario_actual


def requiere_roles(*roles):

    def verificar(
        usuario=Depends(obtener_usuario_actual)
    ):

        if usuario["rol"] not in roles:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para realizar esta acción."
            )

        return usuario

    return verificar