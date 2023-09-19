import { Request, Response } from 'express';
import { CronosError } from '../core/model/interface';
import { Etiquetas } from '../model/modelRelation';

export const getEtiquetas = async (_req: Request, res: Response) => {
    try {

        const etiquetas = await Etiquetas.findMany({
            include:
            {
                // blogs: 'all',
                blogs: ['id', 'titulo'],
            }
        })
        return res.json({
            status: 'success',
            message: 'Lista de etiquetas',
            data: etiquetas
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const getEtiqueta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const etiqueta = await Etiquetas.findUnique({ where: { id: parseInt(id) } })
        if (!etiqueta) return res.status(404).json({ status: 'error', message: 'No existe el Etiqueta' })
        return res.json({
            status: 'success',
            message: 'Etiqueta',
            data: etiqueta
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const createEtiqueta = async (req: Request, res: Response) => {
    try {
        const { nombre, } = req.body;
        const etiqueta = await Etiquetas.create({ data: { nombre } });
        return res.json({
            status: 'success',
            message: 'Etiqueta creado correctamente',
            data: etiqueta
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const updateEtiqueta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const etiqueta = await Etiquetas.update({
            where: { id: parseInt(id) },
            data: { nombre }
        });
        return res.json({
            status: 'success',
            message: 'Etiqueta actualizado correctamente',
            data: etiqueta
        });

    } catch (error) {
        if (error instanceof CronosError) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        } else {
            return res.status(500).json({
                message: 'Error interno del servidor'
            })
        }
    }
}

export const deleteEtiqueta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const etiqueta = await Etiquetas.delete({ where: { id: parseInt(id) } });
        if (!etiqueta) return res.status(404).json({ status: 'error', message: 'No existe el Etiqueta' })
        return res.json({ status: 'success', message: 'Etiqueta eliminado correctamente' });

    } catch (error) {
        if (error instanceof CronosError) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        } else {
            return res.status(500).json({
                message: 'Error interno del servidor'
            })
        }
    }
}

export const getEtiquetasByBlog = async (_req: Request, res: Response) => {
    try {

        const etiquetas = await Etiquetas.findMany({
            include:
            {
                blogs: 'all',
                // clientes: ['id', 'nombre'],
            }
        })
        return res.json({
            status: 'success',
            message: 'Lista de etiquetas',
            data: etiquetas
        });

    } catch (error) {
        console.log(error)
        if (error instanceof CronosError) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        } else if (error instanceof Error) {
            return res.status(500).json({
                message: error.message
            })
        } else {
            return res.status(500).json({
                message: 'Error interno del servidor xxx'
            })
        }
    }
}