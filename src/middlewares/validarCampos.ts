const { validationResult } = require("express-validator");
import { Request, Response, NextFunction } from 'express';

export const validarCampos = (req: Request, res: Response, next: NextFunction): void | Response => {

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        const erroresFormateados: { [campo: string]: string } = {}; // Tipo explícito

        // Itera sobre los errores mapeados y crea un nuevo objeto con el formato deseado
        for (const campo in errores.mapped()) {
            erroresFormateados[campo] = errores.mapped()[campo].msg;
        }

        return res.status(400).json({
            status: 'error',
            // errores: errores.mapped()
            message: 'Error al validar campos',
            data: erroresFormateados
        })
    }

    next();
};