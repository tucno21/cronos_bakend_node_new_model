import { FileArray, UploadedFile } from 'express-fileupload';
import { randomBytes } from 'crypto';
import fs from 'fs';

interface IFileSave {
    file: FileArray,
    fieldName: string[],
    allowedTypes?: string[],
    mode?: 'create' | 'update'
}

const fileSave = ({ file, fieldName, allowedTypes = [], mode = 'create' }: IFileSave) => {

    const error: { [key: string]: string } = {};
    const nameFiles: { [key: string]: string } = {};

    //si el archivo es nulo enviamos errores
    if (file === null) {
        fieldName.forEach(name => error[name] = `El campo ${name} es requerido`);
        return { error: error };
    }

    if (mode === 'create') {
        //verificamos que todos los campos esten llenos
        if (fieldName.some(name => !file[name])) {
            fieldName.forEach(name => (!file[name]) && (error[name] = `El campo ${name} es requerido`));
            return { error: error };
        };
    }


    //verificamos que el archivo sea un tipo permitido
    if (allowedTypes.length > 0) {
        fieldName.forEach(name => {
            if (file[name]) {
                const contentFile = file[name] as UploadedFile;
                const type = contentFile.name.split('.')[contentFile.name.split('.').length - 1];
                if (!allowedTypes.includes(type)) {
                    error[name] = `Tipo de archivo no permitido`;
                }
            }
        })
    }


    //si hay errores enviamoslos
    if (Object.keys(error).length > 0) return { error: error };

    fieldName.forEach(name => {
        if (file[name]) {
            //obtenemos el el achivo por su nombre
            const contentFile = file[name] as UploadedFile;

            //obtenemos la extensión del archivo
            const type = contentFile.name.split('.')[contentFile.name.split('.').length - 1];
            //creamos un nombre aleatorio para el archivo
            const imageName = randomBytes(16).toString('hex');
            //guardamos el nombre generado en nameFiles
            nameFiles[name] = `${imageName}.${type}`;
            //name folder
            const folderName = process.env.FOLDER_NAME || 'imagenes';
            //ruta donde guardaremos el archivo
            const folderPath = './public/' + folderName;
            //generamos la ruta completa del archivo
            const path = `${folderPath}/${imageName}.${type}`;
            //creamos la carpeta si no existe
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            // Guardar la imagen en el directorio
            contentFile.mv(path)
        }
    });

    return { nameFiles };
}

export default fileSave;
