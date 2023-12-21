export default leafstore;
declare class leafstore {
    static SchemaTypes: {
        String: string;
        Number: string;
        Boolean: string;
        Date: string;
        Array: string;
        Object: string;
    };
    /**
     * @typedef {Object} LeafstoreSchemaOptions
     */
    /**
     * creates a leafstore schema
     * @template {Record<string, any>} T
     * @param {T & { _key: string }} object
     * @param {LeafstoreSchemaOptions} options - optional
     * @returns {LeafstoreSchema<T & { _key: string }>}
     */
    static Schema<T_1 extends Record<string, any>>(object: T_1 & {
        _key: string;
    }, options?: Object): LeafstoreSchema<T_1 & {
        _key: string;
    }>;
    /**
     * Creates a leafstore database
     * @param {String} dbName
     */
    constructor(dbName: string);
    /** @type {String} */
    dbName: string;
    /** @type {IDBDatabase | null} */
    _db: IDBDatabase | null;
    /** @type {Record<string, LeafstoreModel>} */
    _models: Record<string, LeafstoreModel<any>>;
    /** @type {Number} */
    version: number;
    /**
     * @typedef {Object} LeafstoreConnectOptions
     * @property {Number} [version] - The version of the database.
     * @property {Function} [onUpgrade] - A function to run when the database is upgraded.
     */
    /**
     * Connects to the database. This method must be called before using the database.
     * This method will create the database if it doesn't exist, and upgrade it if the version is different.
     * Make sure to define all your models before calling this method.
     * @param {LeafstoreConnectOptions} options - optional
     * @returns {Promise<leafstore>}
     */
    connect(options?: {
        /**
         * - The version of the database.
         */
        version?: number | undefined;
        /**
         * - A function to run when the database is upgraded.
         */
        onUpgrade?: Function | undefined;
    }): Promise<leafstore>;
    /**
     * creates a leafstore model
     * @template {Record<string, any>} T
     * @param {String} name
     * @param {LeafstoreSchema<T>} schema
     * @returns {LeafstoreModel<T>}
     */
    Model<T extends Record<string, any>>(name: string, schema: LeafstoreSchema<T>): LeafstoreModel<T>;
    #private;
}
import LeafstoreModel from "./model.js";
import LeafstoreSchema from "./schema.js";
//# sourceMappingURL=leafstore.d.ts.map