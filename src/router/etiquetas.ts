import { Router } from 'express';
import { createEtiqueta, deleteEtiqueta, getEtiqueta, getEtiquetas, updateEtiqueta } from '../controllers/etiquetaController';
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos';

const router = Router();

/* middlewares */
const fields = {
    nombre: check('nombre', 'El Nombre de la etiqueta es requerido').not().isEmpty(),
}

router.get('/', getEtiquetas);
router.get('/:id', getEtiqueta);
router.post('/', [fields.nombre, validarCampos], createEtiqueta);
router.put('/:id', [fields.nombre, validarCampos], updateEtiqueta);
router.delete('/:id', deleteEtiqueta);



export default router;