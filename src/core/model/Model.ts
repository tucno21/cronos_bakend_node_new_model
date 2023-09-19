import { CronosError, FindManyOptions, ModelRelation, SchemaDefinition, createMany, createOptions, deleteOptions, findFirstOptions, findUniqueOptions, mergeWithDefaultSchema, queryRaw, updateOptions } from "./interface";


class Model {
    private database: any
    private modelName: string
    private schema: SchemaDefinition
    private relation?: ModelRelation

    constructor(
        database: any,
        modelName: string,
        schema: SchemaDefinition,
        relation?: ModelRelation

    ) {
        this.database = database;
        this.modelName = modelName;
        this.schema = mergeWithDefaultSchema(schema);
        this.relation = relation;
    }

    private validateFillable(fillable: any) {
        const invalidFields = [];

        if (!Array.isArray(fillable)) {
            const fields = this.getInvalidFields(fillable);
            invalidFields.push(...fields);
        } else {
            fillable.forEach(item => {
                const fields = this.getInvalidFields(item);
                invalidFields.push(...fields);
            });
        }

        if (invalidFields.length > 0) {
            throw new CronosError(`Campos inválidos: ${invalidFields.join(', ')}`);
        }
    }

    private getInvalidFields(fields: any) {
        const validFields = [this.schema.id, ...this.schema.fillable]
        return Object.keys(fields).filter(field => !validFields.includes(field));
    }

    private validateWhere(whereOptions: any) {
        const invalidFields = Object.keys(whereOptions).filter(field => {
            let fillable = this.schema.fillable;
            //agregar el id del modelo
            fillable = [this.schema.id, ...fillable];
            return !fillable.includes(field);
        });

        if (invalidFields.length > 0) {
            throw new CronosError(`no existe el campo : ${invalidFields.join(', ')}`);
        }
    }

    private validateOrderBy(orderBy: any) {
        const invalidFields = Object.keys(orderBy).filter(field => {
            return !this.schema.fillable.includes(field);
        });

        if (invalidFields.length > 0) {
            throw new CronosError(`Invalid ORDER BY fields: ${invalidFields.join(', ')}`);
        }
    }

    private buildWhere(where: any) {
        let sql = '';
        const param: any = {};

        const randomId = Math.random().toString(36).slice(2);

        Object.keys(where).forEach(key => {

            const value = where[key];

            if (typeof value === 'string' || typeof value === 'number') {
                // Valor simple
                sql += `${this.modelName}.${key} = ? AND `;
                // params[key] = value;
                param[`${randomId}_${key}`] = value;

            } else if (typeof value === 'object') {
                // Manejar operadores

                const operator = Object.keys(value)[0];
                const val = value[operator];

                if (operator === '>') {
                    sql += `${this.modelName}.${key} > ? AND `;
                } else if (operator === '<') {
                    sql += `${this.modelName}.${key} < ? AND `;
                }

                // Resto de operadores

                // params[key] = val;
                param[`${randomId}_${key}`] = val;
            }

        });

        sql = sql.slice(0, -4); // Quitar último AND

        return {
            sql,
            param
        };
    }

    private buildQuery(options: FindManyOptions = {}): { sql: string, params: any } {
        const params: any = {};

        let nameModelSLQ = ` ${this.modelName}.*`;
        let selectItemSLQ = ``;
        let json_objectSQL = ``;
        let joinSQL = ``;
        let whereSQL = ``;
        let whereBetweenSQL = ``;
        let andWhereSQL = ``;
        let orWhereSQL = ``;
        let orderBySQL = ``;
        let groupBySQL = ``;
        let limitSQL = ``;
        let offsetSQL = ``;

        //verifificar que el where y whereBetween no s usen al mismo tiempo
        if (options.where && options.whereBetween) {
            throw new CronosError('No se puede combinar where y whereBetween');
        }

        // crear el select
        if (options.select) {
            const invalid = options.select.filter(f => { return !this.schema.fillable.includes(f) && f !== this.schema.id });
            console.log(options.select)
            if (invalid.length > 0) { throw new CronosError(`Invalid SELECT fields: ${invalid.join(', ')}`); }
            //agregarle a cada options.select el nombre del la tabla //ejemplo //ventas.id
            selectItemSLQ += ` ${options.select.map(f => { return `${this.modelName}.${f}` }).join(', ')}`;
        }

        // crear el where
        if (options.where) {
            this.validateWhere(options.where);
            const { sql, param } = this.buildWhere(options.where);
            whereSQL += ` WHERE ${sql}`;
            Object.assign(params, param);
        }

        // crear el whereBetween
        if (options.whereBetween !== undefined) {
            const whereBetweenKeys = Object.keys(options.whereBetween);
            if (whereBetweenKeys.length > 0) {
                whereBetweenKeys.forEach((key, index) => {
                    const [start, end] = options.whereBetween![key]; // Usamos el operador de aserción de tipo "!"
                    if (index === 0) {
                        whereBetweenSQL += ' WHERE ';
                    } else {
                        whereBetweenSQL += ' AND ';
                    }
                    whereBetweenSQL += `${this.modelName}.${key} BETWEEN ? AND ?`;
                    params[`${key}_start`] = start;
                    params[`${key}_end`] = end;
                });
            }
        }

        // crear andWhere
        if (options.andWhere) {
            if (!options.where && !options.whereBetween) {
                throw new CronosError('andWhere requiere previo where o whereBetween');
            }
            this.validateWhere(options.andWhere);
            const { sql, param } = this.buildWhere(options.andWhere);
            andWhereSQL += `AND ${sql}`;
            Object.assign(params, param);
        }

        // crear el orWhere
        if (options.orWhere) {
            if (!options.where && !options.whereBetween) {
                throw new CronosError('orWhere requiere previo where o whereBetween');
            }
            this.validateWhere(options.orWhere);
            const { sql, param } = this.buildWhere(options.orWhere);
            orWhereSQL += `OR ${sql}`;
            Object.assign(params, param);
        }


        //crear el orderBy
        if (options.orderBy) {
            this.validateOrderBy(options.orderBy);
            const orderBys = Object.keys(options.orderBy).map(key => {
                return `${this.modelName}.${key} ${options.orderBy?.[key]}`;
            });
            orderBySQL += ` ORDER BY ${orderBys.join(', ')}`;
        }

        // crear el limit
        if (options.limit) {
            limitSQL += ` LIMIT ?`;
            params.limit = options.limit;
        }

        // crear el offset solo cuando exista limit
        if (options.limit && options.offset) {
            offsetSQL += ` OFFSET ?`;
            params.offset = options.offset;
        } else {
            if (options.offset) throw new CronosError('offset requiere previo limit');
        }


        //crear las relaciones con otras tablas
        if (options.include) {
            const selectFields: string[] = [];
            const joinClauses: string[] = [];
            const groupByData: string[] = [];

            for (const relationName in options.include) {

                if (options.include.hasOwnProperty(relationName)) {
                    const relationOneToMany = this.relation?.oneToMany?.find(r => r.model.modelName === relationName);
                    const relationManyToMany = this.relation?.manyToMany?.find(r => r.model.modelName === relationName);
                    if (!relationOneToMany && !relationManyToMany) throw new CronosError(`La relación "${relationName}" no existe en la modelo "${this.modelName}"`)

                    if (relationOneToMany) {
                        const {
                            model: { modelName, schema },
                            foreignKey,
                        } = relationOneToMany;

                        const asName = modelName.slice(0, -1);





                        const idField = schema.id;
                        let fillableFields = schema.fillable;
                        //agregar idField al inicio de fillableFields
                        fillableFields = [idField, ...fillableFields];
                        const includedFields = options.include[relationName];
                        const selectedFields = includedFields === 'all' ? fillableFields : includedFields;

                        // SELECT
                        selectFields.push(` JSON_OBJECT(${selectedFields.map(field => `'${field}', ${modelName}.${field}`).join(', ')}) AS ${asName}`);

                        // JOIN
                        joinClauses.push(` LEFT JOIN ${modelName} ON ${modelName}.${idField} = ${this.modelName}.${foreignKey}`);
                    }

                    if (relationManyToMany) {
                        const {
                            model: { modelName, schema }, //modelName = nombre de la tabla de relacion
                            pivotTable, //nombre de la tabla de intermedia
                            pivotForeignKey, //nombre de la columna de intermedia del modelo principal venta_id
                            relatedKey, //nombre de la columna de intermedia del modelo relacionado producto_id
                        } = relationManyToMany;

                        const asName = modelName.slice(0, -1); //eliminar el ultimo carater del nombre de la tabla relacional
                        const idField = schema.id; //id de la tabla relacional
                        let fillableFields = schema.fillable; //columnas de la tabla relacional
                        //agregar idField al inicio de fillableFields
                        fillableFields = [idField, ...fillableFields]; //agregar el id a las columnas
                        const includedFields = options.include[relationName]; //obtenemos el valor que pide el controller
                        const selectedFields = includedFields === 'all' ? fillableFields : includedFields;

                        // SELECT
                        selectFields.push(` JSON_ARRAYAGG(JSON_OBJECT(${selectedFields.map(field => `'${field}', ${modelName}.${field}`).join(', ')})) AS ${asName}`);

                        // JOIN
                        joinClauses.push(` INNER JOIN ${pivotTable} ON ${pivotTable}.${pivotForeignKey} = ${this.modelName}.${this.schema.id} INNER JOIN ${modelName} ON ${pivotTable}.${relatedKey} = ${modelName}.${idField}`);

                        //group by
                        groupByData.push(`${this.modelName}.${this.schema.id}`);
                    }
                }
            }

            // const joinSql = joinClauses.join(' ');
            // sql = `SELECT ${selectFields.join(', ')} FROM ${this.modelName} ${joinSql}`;
            json_objectSQL += `,${selectFields.join(', ')}`;
            joinSQL += `${joinClauses.join(' ')}`;
            groupBySQL += `GROUP BY ${groupByData.join(' ')}`
        }

        //si hay select se usa caso contrario se usa el nombre de la tabla
        const sqlInit = (selectItemSLQ === "") ? nameModelSLQ : selectItemSLQ;

        //crear la consulta
        let sql = `SELECT${sqlInit}${json_objectSQL} FROM ${this.modelName}${joinSQL}${whereSQL}${whereBetweenSQL}${andWhereSQL}${orWhereSQL}${orderBySQL}${groupBySQL}${limitSQL}${offsetSQL}`

        return { sql, params };
    }

    relationModel(relation?: ModelRelation) {
        this.relation = relation;
    }

    async findMany(options: FindManyOptions = {}): Promise<any[]> {
        const { sql, params } = this.buildQuery(options);
        console.log(sql);
        // Ejecutar consulta
        const results = await this.database.query(sql, params);
        return results;
    }

    async findUnique(options: findUniqueOptions): Promise<any | null> {
        let { sql, params } = this.buildQuery(options);
        //agregar limit a la consulta
        sql += ` LIMIT 1`;
        console.log(sql);
        // Ejecutar consulta
        const results = await this.database.query(sql, params);
        return results.length > 0 ? results[0] : null;
    }

    async findFirst(options: findFirstOptions): Promise<any | null> {
        let { sql, params } = this.buildQuery(options);
        //agregar limit a la consulta
        sql += ` LIMIT 1`;
        console.log(sql);
        // Ejecutar consulta
        const results = await this.database.query(sql, params);
        return results.length > 0 ? results[0] : null;
    }

    async create(data: createOptions): Promise<any> {
        // //comprobar los campos exista en el modelo
        this.validateFillable(data.data);
        // //obtener los campos de la tabla de data
        let fields = Object.keys(data.data);
        //agregamos los campos de created y updated si existen en el modelo
        (this.schema.timestamps) && (fields = [...fields, `${this.schema.created}`, `${this.schema.updated}`]);
        // creamos ? por la cantidad de campos de la tabla de data
        const fieldsQuestionMarks = fields.map(_field => '?').join(', ');
        //obtener los valores de los campos de la tabla de data
        let values = Object.values(data.data);
        //agregamos valores de created y updated si existen en el modelo
        (this.schema.timestamps) && (values = [...values, new Date(), new Date()]);
        // crear la consulta
        const sql = `INSERT INTO ${this.modelName} (${fields.join(', ')}) VALUES (${fieldsQuestionMarks})`;
        console.log(sql);
        const results = await this.database.query(sql, values);
        //obtener el id del registro insertado
        let id = results.insertId;
        //agregamos al data.data el id como el primer campo
        // data.data = { id, ...data.data };
        // // return data.data;
        // //consultamos el registro insertado

        if (data.conect) {
            const nameRelation = Object.keys(data.conect)[0]
            const dataRelation = Object.values(data.conect)[0]
            //relacionamos cada id con dataRelation cada uno en array propios
            // creamos un array con los id de cada dataRelation //ejemplo // [id,d],[id,d]
            let dataIdRelation = dataRelation.map((d: any) => [id, d]);

            const relationManyToMany = this.relation?.manyToMany?.find(r => r.model.modelName === nameRelation);
            const nameTablePivot = relationManyToMany?.pivotTable;
            const pivotForeignKey = relationManyToMany?.pivotForeignKey;
            const relatedKey = relationManyToMany?.relatedKey;

            //creamos el sql
            const sqlPivot = `INSERT INTO ${nameTablePivot} (${pivotForeignKey}, ${relatedKey}) VALUES ?`;
            console.log(sqlPivot);

            //ejecutamos el sql
            await this.database.query(sqlPivot, [dataIdRelation]);
        }

        return this.findUnique({ where: { id } });
    }

    async update(update: updateOptions): Promise<any> {
        //comprobar los campos exista en el modelo
        this.validateFillable(update.data);
        //buscar el registro que se va a actualizar
        let record = await this.findUnique({ where: update.where });
        //generear error si no existe
        if (!record) throw new CronosError('Registro no encontrado');
        //generar array de campos y valores
        let fields = Object.entries(update.data).map(([field, _value]) => `${field} = ?`);
        //agregamos los campos de updated si existen en el modelo
        (this.schema.timestamps) && (fields = [...fields, `${this.schema.updated} = ?`]);
        //obtener los valores de los campos de la tabla de data
        let values = Object.values(update.data);
        //agregamos valores de updated si existen en el modelo
        (this.schema.timestamps) && (values = [...values, new Date()]);
        //agregar el id al final de los valores
        values = [...values, record.id];
        // crear la consulta
        const sql = `UPDATE ${this.modelName} SET ${fields.join(', ')} WHERE id = ?`;
        await this.database.query(sql, values);
        //modificamos el record con los nuevos valores de Object.values(update.data) y si hay updated
        Object.entries(update.data).forEach(([field, value]) => record[field] = value);
        (this.schema.timestamps) && (record[this.schema.updated!] = new Date());

        if (update.conect) {
            const nameRelation = Object.keys(update.conect)[0]
            const dataRelation = Object.values(update.conect)[0]
            //relacionamos cada id con dataRelation cada uno en array propios
            // creamos un array con los id de cada dataRelation //ejemplo // [id,d],[id,d]
            let dataIdRelation = dataRelation.map((d: any) => [record.id, d]);

            const relationManyToMany = this.relation?.manyToMany?.find(r => r.model.modelName === nameRelation);
            const nameTablePivot = relationManyToMany?.pivotTable;
            const pivotForeignKey = relationManyToMany?.pivotForeignKey;
            const relatedKey = relationManyToMany?.relatedKey;

            //primero eliminamos los relacionado de la tabla pivote
            const deleteSqlPivot = `DELETE FROM ${nameTablePivot} WHERE ${pivotForeignKey} = ?`;
            await this.database.query(deleteSqlPivot, [record.id]);

            //creamos el sql
            const sqlPivot = `INSERT INTO ${nameTablePivot} (${pivotForeignKey}, ${relatedKey}) VALUES ?`;
            console.log(sqlPivot);

            //ejecutamos el sql
            await this.database.query(sqlPivot, [dataIdRelation]);
        }

        //retornamos el registro actualizado
        return record;
    }

    async delete(deleteOptions: deleteOptions): Promise<any> {
        //buscar el registro que se va a eliminar
        let record = await this.findUnique({ where: deleteOptions.where });
        //generear error si no existe
        if (!record) throw new CronosError('Registro no encontrado');
        //crear la consulta
        const sql = `DELETE FROM ${this.modelName} WHERE id = ?`;
        await this.database.query(sql, [record.id]);
        //retornamos el registro eliminado
        return record;
    }

    async createMany(data: createMany): Promise<any> {
        //comprobar los campos exista en el modelo
        this.validateFillable(data.data);
        //obtener los campos de la tabla de data
        let fields = Object.keys(data.data[0]);
        //agregamos los campos de created y updated si existen en el modelo
        (this.schema.timestamps) && (fields = [...fields, `${this.schema.created}`, `${this.schema.updated}`]);
        //creamos varios (?) de los campos que hay en la tabla de data
        const fieldsQuestionMarks = data.data.map(_field => '(' + fields.map(_field => '?').join(', ') + ')').join(', ');
        //obtener los valores de los campos de la tabla de data
        let values = data.data.map(_field => Object.values(_field));
        //agregamos valores de created y updated si existen en el modelo
        (this.schema.timestamps) && (values = values.map(_field => [..._field, new Date(), new Date()]));
        // Aplanar el array de valores
        values = values.flat();
        //crear la consulta
        const sql = `INSERT INTO ${this.modelName} (${fields.join(', ')}) VALUES ${fieldsQuestionMarks}`;
        await this.database.query(sql, values);
        return { status: 'success' };
    }

    async $queryRaw({ query, params = [] }: queryRaw): Promise<any> {
        const results = await this.database.query(query, params);
        return results;
    }
}



export default Model;