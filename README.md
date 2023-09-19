# CRONOS BACKEND NODE JS

## Requirimientos

- node >= 18.0.0


### Directorio de carpetas:

```
📁 backend
├───📁 public/
│   └───📄 index.hmtl
├───📁 src/
│   └───📁 controllers/
│   |   └────📄 authController.ts
│   └───📁 core/
|   |   └───📁 model/
|   |   |   └────📄 Cronos.ts
|   |   |   └────📄 interface.ts
|   |   |   └────📄 Model.ts
│   |   └────📄 config.ts
│   |   └────📄 route.ts
│   |   └────📄 server.ts
│   └───📁 database/
│   |   └────📄 CronosConect.ts
│   └───📁 helpers/
│   |   └────📄 jwt.ts
│   └───📁 middlewares/
│   |   └────📄 validarCampos.ts
│   |   └────📄 validarJwt.ts
│   └───📁 model/
│   |   └────📄 blog.ts
│   └───📁 router/
│       └────📄 blogs.ts
├───📄 .gitignore
├───📄 app.ts
├───📄 blog.sql
├───📄 package.json
├───📄 tsconfig.json
└───📄 .env.example
```

## **Índice**

- [Instalación](#instalacion)
- [Rutas web](#rutas-web)
- [Rutas con middlewares](#rutas-con-middlewares)
- [HTTP request](#http-request)
- [Encriptar el password](#encriptar-el-password)
- [Almacenar Imagenes](#almacenar-imagenes)
- [Generar Tocken](#generar-tocken)
- [Crear Modelos](#crear-modelos)
- [Guardar datos](#guardar-datos)
- [Actualizar datos](#actualizar-datos)
- [Eliminar datos](#eliminar-datos)
- [Consultas](#consultas)
- [Ejemplos de consultas](#ejemplos-de-consultas)

## Instalación

- Clonar el repositorio
- Ejecutar el comando `npm install`
- Crear un archivo `.env` en la raiz del proyecto
- Configurar el archivo `.env` con los datos de la base de datos

## Rutas web
[☝️Inicio](#cronos-backend-node-js)

en la carpeta `router` crear el archivo.ts y el nombre de este archivo es parte de la ruta api
por ejemplo archivo `blogs.ts` y la url quedaria determinado de la siguiente forma

```
http://192.168.158.206:8000/api/blogs
```

```javascript
import { Router } from 'express';
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog } from '../controllers/blogController';

const router = Router();

router.get('/', getBlogs);
router.get('/:id', getBlog);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

export default router;
```


## Rutas con middlewares
[☝️Inicio](#cronos-backend-node-js)

en la carpeta middlewares se tiene para validar el token y procesar con express-validator

```javascript
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos';
import { validarJWT } from '../middlewares/validarJwt';

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
```


## HTTP request
[☝️Inicio](#cronos-backend-node-js)
forma de obtener lo que envia por POST PUT DELETE
```javascript
export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params; //mediante url
    const {name, email} = req.body //mediante post
    const files = req.files  //arrar de imagenes
}
```

## Encriptar el password
[☝️Inicio](#cronos-backend-node-js)
hacer uso de bcrypt
```javascript
import bcrypt from 'bcryptjs';
    const salt = bcrypt.genSaltSync();
    body.password = bcrypt.hashSync(body.password, salt);
```

## Almacenar Imagenes
[☝️Inicio](#cronos-backend-node-js)
usar la funcion fileSave() esta funcion almacena la imagen y retorna los nombres del archivo
```javascript
//le enviamo toto lo que venga del Request
const images = req.files;
//el segundo paramatro es el array con el nombre o nombres a evaluar de los inputs
const result = fileSave({ file: images!, fieldName: ['imagen'] });

//file save acepta dos parametros mas que son opcionales
//allowedTypes: verifica las extenciones permitidas ejemplo 'jpg' , 'png', etc
//cuarto parametro si se cambia por update, este deja de verifcar que todos los nombres del array se cumplan
const result = fileSave ({ file, fieldName, allowedTypes = [], mode = 'create' }) 

//FORM DE RETONO DE fileSave()
// "result" puede ser error | nameFiles
        if ('error' in result) return res.status(400).json({
            status: 'error',
            message: 'Error al guardar imagen',
            data: result.error
        });

//si todo esta bien obtenemos el nombre
        const { imagen } = result.nameFiles;


//ELIMINAR IMAGEN
import fileDelete from '../helpers/fileDelete';
//enviar el nombre de la imagen
fileDelete(usuario.imagen);
```


## Generar Tocken
[☝️Inicio](#cronos-backend-node-js)
hacer uso de la funcion generateJWT()
```javascript
import { generateJWT } from '../helpers/jwt';
const token = await generateJWT({ uid: usuario.id, email: usuario.email });
```

## Crear Modelos
[☝️Inicio](#cronos-backend-node-js)
en la carpeta model crear con el nombre.ts

#### modelo basico
```javascript
import Cronos from "../core/model/Cronos";

const User = Cronos.model('usuarios', //mombre de la tabla
    {
        id: 'id', //nombre del id principal
        fillable: ['nombre', 'email', 'password', 'imagen'], //nombre de los campos
        hidden: ['password'], //lo que se oculta en el retorno //no es obligatorio
        timestamps: true, //false por defecto //activamos para la fecha automatica por el servidor //no es obligatorio
        created: 'created_at', //nombre por defecto puede cambiar //no es obligatorio
        updated:'updated_at' //nombre por defecto puede cambiar //no es obligatorio
    },
);

export default User;
```


#### modelo con una relación
```javascript
import Cronos from "../core/model/Cronos";
import Rol from "./rol";

const User = Cronos.model('usuarios', //mombre de la tabla
    {
        id: 'id', //nombre del id principal
        fillable: ['nombre', 'email', 'password', 'imagen', 'rol_id'], //nombre de los campos
    },
    {
        oneToMany: [  //una sola relacion
        {
            model: Rol,  //modelo que se relaciona
            foreignKey: 'rol_id' //campo de modelo con que se relaciona
        }
    ],
    }
);

export default User;
```


#### modelo con una relación de tabla intermedia pivote
para ello los dos modelos deben estan en solo archivo de la siguiente manera
```javascript
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
    manyToMany: [ //relacion muchos a muchos
        {
            model: Etiquetas, //modelo que se relaciona
            pivotTable: 'blogs_etiquetas', //nombre de la tabla pivote
            pivotForeignKey: 'blog_id', //nombre de la tabla principal de relacion
            relatedKey: 'etiqueta_id', //nombre de la otra tabla que se relaciona
        }
    ]
})

Etiquetas.relationModel({
    manyToMany: [ //relacion muchos a muchos
        {
            model: Blog, //modelo que se relaciona
            pivotTable: 'blogs_etiquetas', //nombre de la tabla pivote
            pivotForeignKey: 'etiqueta_id', //nombre de la tabla principal de relacion
            relatedKey: 'blog_id', //nombre de la otra tabla que se relaciona
        }
    ]
})

export { Blog, Etiquetas };
```



## Guardar datos
[☝️Inicio](#cronos-backend-node-js)
```javascript
const { titulo, contenido, usuario_id } = req.body;
const blog = await Blog.create({ data: { titulo, contenido, usuario_id }});


//si el modelo tiene una relacion con mediante una tabla intermedia
let { titulo, contenido, usuario_id, etiquetas } = req.body;
//enviar el array de IDs de la otra tabla
f (!Array.isArray(etiquetas)) etiquetas = [etiquetas];
//conect se usa para enviar los id de la otra tabla //etiquetas: debe ser el nombre de la tabla en relacion
const blog = await Blog.create({ data: { titulo, contenido, usuario_id }, conect: { etiquetas: etiquetas } });


//CREAR EN BLOQUE
const venta = await Categoria.createMany({
   data: [
        { nombre: 'mouses' },
        { nombre: 'monitores' },
        { nombre: 'Tablets' },
        { nombre: 'Accesorios' }
   ]
})
```

## Actualizar datos
[☝️Inicio](#cronos-backend-node-js)
```javascript
const { id } = req.params;
const { titulo, contenido, usuario_id } = req.body;
const blog = await Blog.update({
    where: { id: parseInt(id) },
    data: { titulo, contenido, usuario_id },
});


//si el modelo tiene una relacion con mediante una tabla intermedia
let { titulo, contenido, usuario_id, etiquetas } = req.body;
if (!Array.isArray(etiquetas)) etiquetas = [etiquetas];
//para actualizar el metodo elimina todo los id de de la tabla pivote que se relaciona
const blog = await Blog.update({
    where: { id: parseInt(id) },
    data: { titulo, contenido, usuario_id },
    conect: { etiquetas: etiquetas }
});
```

## Eliminar datos
[☝️Inicio](#cronos-backend-node-js)
```javascript
const { id } = req.params;
const blog = await Blog.delete({ where: { id: parseInt(id) } });
```

## Consultas
[☝️Inicio](#cronos-backend-node-js)
```javascript
//obtener todos los registros de la tabla no se puede anidar
const usuarios = await User.findMany({});

//obtener un solo registro no es obligatorio where
const blog = await Blog.findFirst({})

//obtener un solo registro es obligatorio el where
const blog = await Blog.findUnique({
    where: { id: parseInt(id) },
})


//consultas personalizadas
const cliente = await Cliente.findMany({
    select: ['id', 'nombre', 'correo'], //los campos que quieres de la tabla
    where: { edad: 20 },  //condicion de busqueda busca todo igual
    where: { edad: { '>': 20 } }, //condion cor operador
    whereBetween: { edad: [20, 30] }, //condicion entre rangos
    andWhere: { edadsd: { '<': 22 } }, //agregamos una condicion AND
    orWhere: { edad: { '>': 20 } },  //agregamos una condicion OR
    orderBy: { telefono: 'desc' }, //ordenar resultado
    limit: 5, //limitar cantidad de registros
})

//where con whereBetween no pueden ir juntos
//andWhere y orWhere necesitan primero where o whereBetween


// los metodo findFirst y findUnique aceptan los parametros anteriores pero no limit
```


## EJEMPLOS DE CONSULTAS
[☝️Inicio](#cronos-backend-node-js)
```javascript
//consulta con relacion de con otras tablas

const venta = await Etiquetas.findMany({
    include:
    {
        clientes: 'all',  //si se usa all el retorno es todo lo que tiene la tabla clientes
        clientes: ['id', 'nombre'], //si se usa array el retorno es de los campos del array
    }
})


//CONSULTA PERSONALIZADA
const venta = await Categoria.$queryRaw({
    query: `SELECT * FROM categorias`,
    params: []
})
```