import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, JsonWebTokenError } from 'jsonwebtoken';

export const validarJWT = (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
        //leer el token
        const token = req.header('x-token');
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No hay token en la petición'
            })
        }

        const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
        // const data = jwt.verify(token, jwtSecret) as JwtPayload;
        jwt.verify(token, jwtSecret) as JwtPayload;

        // En este punto, TypeScript sabe que data es del tipo JwtPayload,
        // por lo que puedes acceder a la propiedad iat sin problemas.
        // No es necesario eliminar iat y exp manualmente.
        //eliminar de data.iat and data.exp
        // delete data.iat;
        // delete data.exp;

        //enviar data en req
        // req.body.dataToken = data;
        // console.log({ 'desde validar token': data });


        next();

    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'El token ha expirado',
                });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'El token no es válido',
                });
            }
        } else {
            return res.status(401).json({
                status: 'error',
                message: 'error desconocido de comprobación del token',
            })
        }
    }
}


