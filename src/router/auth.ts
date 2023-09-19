import { Router } from 'express';
import { createUser, getUser } from '../controllers/authController';
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos';

const router = Router();

router.post('/login', [
    /* middlewares */
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], getUser);

router.post('/register', [
    /* middlewares */
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], createUser);

export default router;