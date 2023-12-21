export default LeafstoreModel;
export type LeafstoreModelConfig = {
    /**
     * - The database to use.
     */
    db?: IDBDatabase | null | undefined;
    /**
     * - The name of the object store.
     */
    objectStoreName?: string | null | undefined;
};
/**
 * @typedef {Object} LeafstoreModelConfig
 * @property {IDBDatabase | null} [db] - The database to use.
 * @property {String | null} [objectStoreName] - The name of the object store.
 */
/**
 * @template {Record<string, any>} T
 * @class
 */
declare class LeafstoreModel<T extends Record<string, any>> {
    /**
     * Creates a leafstore model
     * @param {String} name
     * @param {LeafstoreSchema<T>} schema
     * @param {LeafstoreModelConfig} config - optional
     */
    constructor(name: string, schema: LeafstoreSchema<T>, config?: LeafstoreModelConfig);
    name: string;
    _schema: LeafstoreSchema<T>;
    _db: IDBDatabase | null | undefined;
    _objectStoreName: string;
    _deletedKeys: any[];
    /**
     * Creates a new document
     * @param {Object} object
     * @returns {Promise<LeafstoreDocument<T>>}
     */
    create(object: Object): Promise<LeafstoreDocument<T>>;
    /**
     * Inserts a document. If the document already exists, it is updated.
     * @param {Object} object
     * @param {String} key
     * @returns {Promise<LeafstoreDocument<T>>}
     */
    insertOne(object: Object, key: string): Promise<LeafstoreDocument<T>>;
    /**
     * Finds a document by its primary key
     * @param {String} key
     * @returns {Promise<LeafstoreDocument<T> | null>}
     */
    findByKey(key: string): Promise<LeafstoreDocument<T> | null>;
    /**
     * Finds the first document matching the query.
     * If no query is provided, the first document to come up is returned.
     * Order is not guaranteed.
     * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
     * @returns {Promise<LeafstoreDocument<T> | null>}
     */
    findOne(query?: Object | IDBValidKey | IDBKeyRange | null | undefined): Promise<LeafstoreDocument<T> | null>;
    /**
     * Finds all documents matching the query
     * if no query is provided, all documents are returned
     * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
     * @returns {Promise<LeafstoreDocument<T>[]>}
     * @example
     * // find all documents
     * const documents = await User.find();
     *
     * // find all documents with the name 'John Doe'
     * const documents = await User.find({ name: 'John Doe' });
     *
     * // find all documents with the name 'John Doe' and age 20
     * const documents = await User.find({ name: 'John Doe', age: 20 });
     *
     * // find all documents with the name 'John Doe' and age greater than 20
     * const documents = await User.find({ name: 'John Doe', age: { $gt: 20 } });
     */
    find(query?: Object | IDBValidKey | IDBKeyRange | null | undefined): Promise<LeafstoreDocument<T>[]>;
    /**
     * Deletes a document by its primary key
     * @param {String} key
     * @returns {Promise<void>}
     */
    findByKeyAndDelete(key: string): Promise<void>;
    /**
     * Deletes the first document matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
     * @returns {Promise<void>}
     */
    deleteOne(query?: Object | IDBValidKey | IDBKeyRange | null | undefined): Promise<void>;
    /**
     * Deletes all documents matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
     * @returns {Promise<void>}
     */
    deleteMany(query?: Object | IDBValidKey | IDBKeyRange | null | undefined): Promise<void>;
    /**
     * Deletes all documents
     * @returns {Promise<void>}
     */
    deleteAll(): Promise<void>;
    /**
     * Updates a document by its primary key
     * @param {String} key
     * @param {Object} object
     * @returns {Promise<LeafstoreDocument<T>>}
     */
    findByKeyAndUpdate(key: string, object: Object): Promise<LeafstoreDocument<T>>;
    /**
     * Updates the first document matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} query - The query to match.
     * @param {Object} object
     * @returns {Promise<LeafstoreDocument<T>>}
     */
    updateOne(query: Object | IDBValidKey | IDBKeyRange | null, object: Object): Promise<LeafstoreDocument<T>>;
    /**
     * Updates all documents matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} query - The query to match.
     * @param {Object} object
     * @returns {Promise<LeafstoreDocument<T>[]>}
     */
    updateMany(query: Object | IDBValidKey | IDBKeyRange | null, object: Object): Promise<LeafstoreDocument<T>[]>;
    /**
     * Counts the number of documents matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
     * @returns {Promise<Number>}
     */
    count(query?: Object | IDBValidKey | IDBKeyRange | null | undefined): Promise<number>;
    #private;
}
import LeafstoreSchema from "./schema.js";
import LeafstoreDocument from "./document.js";
//# sourceMappingURL=model.d.ts.map