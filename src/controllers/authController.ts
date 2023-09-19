import { Request, Response } from 'express';
import { generateJWT } from '../helpers/jwt';
import fileSave from '../helpers/fileSave';
import bcrypt from 'bcryptjs';
import User from '../model/user';

export const getUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        //verificar si el email existe
        const usuario = await User.findFirst({ where: { email } })

        //si no existe
        if (usuario === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'El email no existe'
            });
        }

        // verificar password
        const validarPassword = bcrypt.compareSync(password, usuario.password);
        if (!validarPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'La contraseña es incorrecta'
            });
        }

        //generar el token
        const token = await generateJWT({ uid: usuario.id, email: usuario.email });

        //elimanar el password del objeto
        usuario.password = undefined;

        return res.json({
            status: 'success',
            message: 'Usuario logueado correctamente',
            data: usuario,
            token
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

export const createUser = async (req: Request, res: Response): Promise<Response> => {
    // try {
    const { body } = req;

    //buscar si el email existe
    const comprobar = await User.findFirst({ where: { email: body.email } })

    //si existe
    if (comprobar) {
        return res.status(400).json({
            status: 'error',
            message: 'El email ya existe'
        });
    }

    const images = req.files;
    const result = fileSave({ file: images!, fieldName: ['imagen'] });

    if ('error' in result) return res.status(400).json({
        status: 'error',
        message: 'Error al guardar imagen',
        data: result.error
    });

    const { imagen } = result.nameFiles;
    //agregar imagen a body
    body.imagen = imagen;

    //encriptar password
    const salt = bcrypt.genSaltSync();
    body.password = bcrypt.hashSync(body.password, salt);

    //guardar usuario
    const usuario = await User.create({ data: body });

    //generar el token
    const token = await generateJWT({ uid: usuario.id, email: usuario.email });

    return res.json({
        status: 'success',
        message: 'Usuario creado correctamente',
        data: usuario,
        token
    });

    // } catch (error: any) {
    //     return res.status(500).json({
    //         msg: 'Error en el servidor',
    //         error: error.message
    //     });
    // }
}
