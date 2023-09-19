import jwt from 'jsonwebtoken';

interface Props {
    uid: string;
    email: string;
}

export const generateJWT = async ({ uid, email }: Props): Promise<string> => {
    const payload = { uid, email };

    try {
        const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

        return token as string;
    } catch (error) {
        throw new Error('No se pudo generar el token' + error);
    }
};


// export const generateJWT = ({ uid, email }: Props) => {

//     return new Promise((resolve, reject) => {

//         const payload = { uid, email };

//         const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
//         jwt.sign(payload, jwtSecret, {

//             expiresIn: '24h'

//         }, (err: any, token: any) => {

//             if (err) {


//                 reject('No se pudo generar el token');

//             } else {

//                 resolve(token);

//             }
//         });
//     });
// }

// export const comprobarJWT = (token = '') => {
//     try {
//         const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
//         const { uid } = jwt.verify(token, jwtSecret);
//         return [true, uid];
//     } catch (error) {
//         return [false, null];
//     }
// }