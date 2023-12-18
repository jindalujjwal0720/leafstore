const LeafstoreSchema = require("./schema");
const LeafstoreModel = require("./model");

class leafstore {
  /**
   * Creates a leafstore database
   * @param {String} dbName
   * @returns {leafstore}
   */
  constructor(dbName) {
    if (!dbName) throw new Error("dbName is required");
    if (typeof dbName !== "string") throw new Error("dbName must be a string");
    /** @type {String} */
    this.dbName = dbName;
    /** @type {IDBDatabase} */
    this._db = null;
    /** @type {Record<string, LeafstoreModel>} */
    this._models = {};
    /** @type {Number} */
    this.version = 1;
  }

  static SchemaTypes = {
    /** @type {String} */
    String: "string",
    /** @type {Number} */
    Number: "number",
    /** @type {Boolean} */
    Boolean: "boolean",
    /** @type {Date} */
    Date: "date",
    /** @type {Array} */
    Array: "array",
    /** @type {Object} */
    Object: "object",
  };

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
  async connect(
    options = {
      version: 1,
      onUpgrade: null,
    }
  ) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(
        this.dbName,
        options.version || this.version
      );
      request.onupgradeneeded = (e) => {
        this._db = e.target.result;

        // create object store for schemas
        const schemaStore = this._db.createObjectStore("schemas", {
          keyPath: "name",
        });
        schemaStore.createIndex("name", "name", { unique: true });

        // store schemas in the database
        for (let key in this._models) {
          if (this._models.hasOwnProperty(key)) {
            console.log(this._models[key]._schema._schema);
            schemaStore.add({
              name: key,
              schema: this._models[key]._schema._rawSchema,
            });
          }
        }

        // create object stores for models
        for (let key in this._models) {
          if (this._models.hasOwnProperty(key)) {
            this.#generateObjectStore(this._models[key]);
          }
        }

        if (typeof options.onUpgrade === "function") {
          options.onUpgrade(this);
        }
      };
      request.onsuccess = (e) => {
        this._db = e.target.result;
        this.version = this._db.version;

        // get schemas from database
        const transaction = this._db.transaction("schemas", "readonly");
        const schemaStore = transaction.objectStore("schemas");
        const request = schemaStore.getAll();
        request.onsuccess = (e) => {
          const schemas = e.target.result;
          for (let schema of schemas) {
            this._models[schema.name] = new LeafstoreModel(
              schema.name,
              new LeafstoreSchema(schema.schema),
              {
                db: this._db,
              }
            );
          }
        };

        // assign db to models
        for (let key in this._models) {
          if (this._models.hasOwnProperty(key)) {
            this._models[key]._db = this._db;
          }
        }

        resolve(this);
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Generates an object store for a model
   * @param {LeafstoreModel<T>} model
   * @returns {void}
   */
  #generateObjectStore(model) {
    const { _objectStoreName: objectStoreName, _schema } = model;
    const { autoIncrement, primaryKeyPath } = _schema;

    const objectStore = this._db.createObjectStore(objectStoreName, {
      autoIncrement,
      keyPath: primaryKeyPath,
    });
    // create indexes for object store fields
    this.#generateIndexes(objectStore, _schema._schema);
  }

  /**
   * Generates indexes for an object store
   * @param {IDBObjectStore} objectStore - The object store to generate indexes for
   * @param {Object} schema - The schema of the object store
   * @returns {void}
   */
  #generateIndexes(objectStore, schema) {
    const flatten = (obj, prefix = "") =>
      Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? `${prefix}.` : "";
        if (
          typeof obj[k] === "object" &&
          (obj[k]._type === null || obj[k]._type === undefined)
        )
          assign(acc, flatten(obj[k], `${pre + k}`));
        else acc[`${pre + k}`] = obj[k];
        return acc;
      }, {});

    const assign = (obj, src) => {
      Object.keys(src).forEach((key) => (obj[key] = src[key]));
      return obj;
    };

    const flattenedSchema = flatten(schema);

    for (let key in flattenedSchema) {
      if (flattenedSchema.hasOwnProperty(key)) {
        const value = flattenedSchema[key];
        if (value?._unique) {
          objectStore.createIndex(key, key, { unique: true });
        } else {
          objectStore.createIndex(key, key);
        }
      }
    }
  }

  /**
   * It is recommended to give a key to your schema. Auto incrementing keys are not supported by browsers completely yet.
   * @typedef {Object} LeafstoreSchemaOptions
   * @property {Boolean} autoIncrement - Whether to auto increment the primary key.
   * @property {String} key - The primary key path of the schema.
   */

  /**
   * creates a leafstore schema
   * @param {T} object
   * @param {LeafstoreSchemaOptions} options - optional
   * @returns {LeafstoreSchema<T>}
   */
  static Schema(
    object,
    options = {
      autoIncrement: true,
      key: null,
    }
  ) {
    return new LeafstoreSchema(object, options);
  }

  /**
   * creates a leafstore model
   * @template T
   * @param {String} name
   * @param {LeafstoreSchema<T>} schema
   * @returns {LeafstoreModel<T>}
   */
  Model(name, schema) {
    if (!name) throw new Error("Name is required");
    if (typeof name !== "string") throw new Error("Name must be a string");
    if (this._models[name]) return this._models[name];
    if (!schema) throw new Error("Schema is required");
    if (!(schema instanceof LeafstoreSchema)) {
      throw new Error("schema must be an instance of LeafstoreSchema");
    }

    const pluralise = (word) => {
      if (word.endsWith("s")) return word;
      return word + "s";
    };
    const objectStoreName = pluralise(name.toLowerCase());

    // TODO: create a model
    this._models[name] = new LeafstoreModel(name, schema, {
      db: this._db,
      objectStoreName,
    });

    return this._models[name];
  }
}

module.exports = leafstore;
