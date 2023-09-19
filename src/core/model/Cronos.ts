import dataBase from "../../database/CronosConect";
import Model from "./Model";
import { ModelRelation, SchemaDefinition } from "./interface";

class CronoOrm {
    constructor(private database: any) {
        // Aquí puedes configurar la conexión a tu base de datos
    }

    model(
        modelName: string,
        schema: SchemaDefinition,
        relation?: ModelRelation
    ) {
        // Define el modelo y su esquema
        return new Model(this.database, modelName, schema, relation);
    }
}


const Cronos = new CronoOrm(dataBase);

export default Cronos;