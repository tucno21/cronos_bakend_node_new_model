import { Request } from 'express';

const ruta = (req: Request) => {
    const folderName = process.env.FOLDER_NAME || 'imagenes';
    // url de imagen
    const url = `${req.protocol}://${req.get('host')}/${folderName}/`;
    return url
}

export const pathFolder = ruta;

