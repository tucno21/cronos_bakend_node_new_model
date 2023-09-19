import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos';
import { validarJWT } from '../middlewares/validarJwt';


const router = Router();
const fields = {
    email: check('email', 'El email es obligatorio').not().isEmpty(),
    password: check('password', 'La contraseña es obligatoria').not().isEmpty(),
    nombre: check('nombre', 'El nombre es obligatorio').not().isEmpty(),
}

//CRUD de usuarios
router.get('/', [validarJWT], getUsers);
router.get('/:id', [validarJWT], getUser);
router.post('/', [validarJWT, fields.nombre, fields.email, fields.password, validarCampos], createUser);
router.put('/:id', [validarJWT, fields.nombre, fields.email, validarCampos], updateUser);
router.delete('/:id', [validarJWT], deleteUser);

export default router;