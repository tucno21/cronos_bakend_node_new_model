import fs from 'fs';

const fileDelete = (fileName: string) => {
    //name folder
    const folderName = process.env.FOLDER_NAME || 'imagenes';
    //ruta donde guardaremos el archivo
    const folderPath = './public/' + folderName;
    //generamos la ruta completa del archivo
    const path = `${folderPath}/${fileName}`;
    //eliminamos el archivo
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}

export default fileDelete