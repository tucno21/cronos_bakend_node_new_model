import { Request, Response } from 'express';
import { Blog } from '../model/modelRelation';

export const getBlogs = async (_req: Request, res: Response) => {
    try {
        const blogs = await Blog.findMany({
            include:
            {
                // usuarios: 'all',
                usuarios: ['id', 'nombre'],
                etiquetas: 'all',
            }
        });
        return res.json({
            status: 'success',
            message: 'Blogs encontrados',
            data: blogs
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const getBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findUnique({
            where: { id: parseInt(id) },
            include:
            {
                // usuarios: 'all',
                usuarios: ['id', 'nombre'],
                etiquetas: 'all',
            }
        })

        // const etiquetas = await blogEtiquetas.select('etiquetas.id', 'etiquetas.nombre')
        //     .join('etiquetas', 'blogs_etiquetas.etiqueta_id', '=', 'etiquetas.id')
        //     .where('blogs_etiquetas.blog_id', '=', id)
        //     .get();

        // //agregamos las etiquetas al blog
        // blog.etiquetas = etiquetas;

        if (!blog) return res.status(404).json({
            status: 'error',
            message: 'No existe el blog'
        });

        return res.json({
            status: 'success',
            message: 'Blog encontrado',
            data: blog
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const createBlog = async (req: Request, res: Response) => {
    try {
        let { titulo, contenido, usuario_id, etiquetas } = req.body;
        //preguntar si etiquetas es un array y si no es creamos un array
        if (!Array.isArray(etiquetas)) etiquetas = [etiquetas];
        const blog = await Blog.create({ data: { titulo, contenido, usuario_id }, conect: { etiquetas: etiquetas } });

        return res.json({
            status: 'success',
            message: 'Blog creado',
            data: blog
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const updateBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // const { titulo, contenido, usuario_id, etiquetas } = req.body;
        let { titulo, contenido, usuario_id, etiquetas } = req.body;
        //preguntar si etiquetas es un array y si no es creamos un array
        if (!Array.isArray(etiquetas)) etiquetas = [etiquetas];

        // Paso 1: Actualiza el blog en la tabla "blogs"
        const blog = await Blog.update({
            where: { id: parseInt(id) },
            data: { titulo, contenido, usuario_id },
            conect: { etiquetas: etiquetas }
        });

        return res.json({
            status: 'success',
            message: 'Blog actualizado',
            data: blog
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const blog = await Blog.delete({ where: { id: parseInt(id) } });
        if (!blog) return res.status(404).json({
            status: 'error',
            message: 'No existe el blog'
        })

        return res.json({
            status: 'success',
            message: 'Blog eliminado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}