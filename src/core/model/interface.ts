import Model from "./Model";

export type SchemaDefinition = {
    id: string
    fillable: string[],
    hidden?: string[],
    timestamps?: boolean,
    created?: string,
    updated?: string
};

// Definir valores predeterminados
const DEFAULT_SCHEMA: SchemaDefinition = {
    id: 'id',
    fillable: [],
    hidden: [],
    timestamps: false,
    created: 'created_at',
    updated: 'updated_at',
};

// Combinar valores predeterminados con los valores proporcionados
export function mergeWithDefaultSchema(schema: SchemaDefinition): SchemaDefinition {
    return { ...DEFAULT_SCHEMA, ...schema };
}

export type ModelRelation = {
    oneToMany?: {
        model: Model;
        foreignKey: string;
    }[];

    manyToMany?: {
        model: Model;
        pivotTable: string;
        pivotForeignKey: string;
        relatedKey: string;
    }[]
}

export interface FindManyOptions {
    select?: string[];
    where?: { [key: string]: string | number | { [operator: string]: string | number } }
    andWhere?: { [key: string]: string | number | { [operator: string]: string | number } }
    orWhere?: { [key: string]: string | number | { [operator: string]: string | number } }
    whereBetween?: { [key: string]: [string | number, string | number] };
    orderBy?: { [key: string]: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
    include?: { [relatedModel: string]: string[] | 'all'; }
}

export interface findUniqueOptions extends Omit<FindManyOptions, 'limit' | 'offset'> {
    where: { [key: string]: string | number | { [operator: string]: string | number } }
}

export interface findFirstOptions extends Omit<FindManyOptions, 'limit' | 'offset'> {
}

export interface createOptions {
    data: { [key: string]: any },
    conect?: { [key: string]: string[] | number[] }
}

export interface updateOptions {
    where: { [key: string]: number }
    data: { [key: string]: any }
    conect?: { [key: string]: string[] | number[] }
}

export interface deleteOptions {
    where: { [key: string]: number }
}

export interface createMany {
    data: { [key: string]: any }[]
}

export interface queryRaw {
    query: string;
    params?: any[];
}

export class CronosError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "CronosError";
    }
}