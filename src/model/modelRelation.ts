import Cronos from "../core/model/Cronos";
import User from "./user";

const Blog = Cronos.model('blogs',
    {
        id: 'id',
        fillable: ['titulo', 'contenido', 'usuario_id'],
        hidden: [],
        timestamps: true,
    }
);

const Etiquetas = Cronos.model('etiquetas',
    {
        id: 'id',
        fillable: ['nombre'],
        hidden: [],
        // timestamps: true,
    },
);

Blog.relationModel({
    oneToMany: [
        {
            model: User,
            foreignKey: 'usuario_id'
        }
    ],
    manyToMany: [
        {
            model: Etiquetas,
            pivotTable: 'blogs_etiquetas',
            pivotForeignKey: 'blog_id',
            relatedKey: 'etiqueta_id',
        }
    ]
})

Etiquetas.relationModel({
    manyToMany: [
        {
            model: Blog,
            pivotTable: 'blogs_etiquetas',
            pivotForeignKey: 'etiqueta_id',
            relatedKey: 'blog_id',
        }
    ]
})

export { Blog, Etiquetas };