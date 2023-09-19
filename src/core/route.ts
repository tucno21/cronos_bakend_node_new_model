import { Router } from 'express';
//importamos el lector de archivos
const fs = require('fs');

const router = Router();

//ruta de los archivos de rutas para leer
const pathRouter = `${__dirname}/../router`;

//funcion para remover la extension de los archivos
const removeExtension = (fileName: string) => {
    return fileName.split('.').shift();
}

//leemos los archivos de la ruta
const archivos = fs.readdirSync(pathRouter);

//recorremos los archivos
archivos.filter((archivo: string) => {
    //removemos la extension de los archivos y los guardamos en una constante
    const archivoSinExtension = removeExtension(archivo);

    //importamos el archivo de rutas
    const routeMiddleware = require(`./../router/${archivoSinExtension}`).default;

    //agregamos la ruta al router
    router.use(`/${archivoSinExtension}`, routeMiddleware);
});

export default router;