declare module "leafstore-db" {
  /**
   * @template {Record<string, any>} T
   * @class
   */
  export class LeafstoreDocument<T extends Record<string, any>> {
    /**
     * Creates a Leafstore document. This class is not meant to be instantiated directly.
     * {@link LeafstoreModel} will call this class automatically for you.
     *
     * @param {T} object
     * @param {LeafstoreModel<T>} model
     * @param {Boolean} [isNew=true]
     */
    constructor(
      object: T,
      model: LeafstoreModel<T>,
      isNew?: boolean | undefined
    );
    _object: T;
    _model: LeafstoreModel<T>;
    _isNew: boolean;
    /**
     * @returns {String}
     */
    toString(): string;
    /**
     * @returns {Object}
     */
    toJSON(): Object;
    /**
     * Saves the document to the database. If the document is new, it will be created.
     * @returns {Promise<LeafstoreDocument<T>>}
     */
    save(): Promise<LeafstoreDocument<T>>;
  }

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
  export class LeafstoreModel<T extends Record<string, any>> {
    /**
     * Creates a leafstore model
     * @param {String} name
     * @param {LeafstoreSchema<T>} schema
     * @param {LeafstoreModelConfig} config - optional
     */
    constructor(
      name: string,
      schema: LeafstoreSchema<T>,
      config?: LeafstoreModelConfig
    );
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
    findOne(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<LeafstoreDocument<T> | null>;
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
    find(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<LeafstoreDocument<T>[]>;
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
    deleteOne(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<void>;
    /**
     * Deletes all documents matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
     * @returns {Promise<void>}
     */
    deleteMany(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<void>;
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
    findByKeyAndUpdate(
      key: string,
      object: Object
    ): Promise<LeafstoreDocument<T>>;
    /**
     * Updates the first document matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} query - The query to match.
     * @param {Object} object
     * @returns {Promise<LeafstoreDocument<T>>}
     */
    updateOne(
      query: Object | IDBValidKey | IDBKeyRange | null,
      object: Object
    ): Promise<LeafstoreDocument<T>>;
    /**
     * Updates all documents matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} query - The query to match.
     * @param {Object} object
     * @returns {Promise<LeafstoreDocument<T>[]>}
     */
    updateMany(
      query: Object | IDBValidKey | IDBKeyRange | null,
      object: Object
    ): Promise<LeafstoreDocument<T>[]>;
    /**
     * Counts the number of documents matching the query
     * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
     * @returns {Promise<Number>}
     */
    count(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<number>;
  }

  export type LeafstoreSchemaOptions = Object;
  /**
   * @typedef {Object} LeafstoreSchemaOptions
   */
  /**
   * @template {Record<string, any>} T
   * @class
   */
  export class LeafstoreSchema<T extends Record<string, any>> {
    /**
     * Creates a Leafstore schema. This should not be called directly. Use {@link leafstore.Schema} instead.
     * @param {T} object - The template object used to generate the schema.
     * @param {LeafstoreSchemaOptions} options - Optional configuration for the schema.
     */
    constructor(object: T, options?: LeafstoreSchemaOptions);
    _rawSchema: T;
    _schema: Object;
    /**
     * Validates an object against the schema.
     * @param {Object} object - The object to validate.
     * @returns {void}
     * @throws {Error} Throws an error if the object is invalid.
     */
    validate(object: Object): void;
    /**
     * Casts an object to the schema.
     * @param {Object} object - The object to cast.
     * @returns {Object} The casted object.
     * @throws {Error} Throws an error if the object is invalid.
     */
    cast(object: Object): Object;
  }

  export default class leafstore {
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
    static Schema<T_1 extends Record<string, any>>(
      object: T_1 & {
        _key: string;
      },
      options?: Object
    ): LeafstoreSchema<
      T_1 & {
        _key: string;
      }
    >;
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
    Model<T extends Record<string, any>>(
      name: string,
      schema: LeafstoreSchema<T>
    ): LeafstoreModel<T>;
  }
}
