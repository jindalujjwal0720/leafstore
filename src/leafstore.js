// const LeafstoreSchema = require("./schema.js");
// const LeafstoreModel = require("./model.js");
import LeafstoreSchema from "./schema.js";
import LeafstoreModel from "./model.js";

class leafstore {
  /**
   * Creates a leafstore database
   * @param {String} dbName
   */
  constructor(dbName) {
    if (!dbName) throw new Error("dbName is required");
    if (typeof dbName !== "string") throw new Error("dbName must be a string");
    /** @type {String} */
    this.dbName = dbName;
    /** @type {IDBDatabase | null} */
    this._db = null;
    /** @type {Record<string, LeafstoreModel>} */
    this._models = {};
    /** @type {Number} */
    this.version = 1;
  }

  static SchemaTypes = {
    String: "string",
    Number: "number",
    Boolean: "boolean",
    Date: "date",
    Array: "array",
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
      onUpgrade: () => {},
    }
  ) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(
        this.dbName,
        options.version || this.version
      );
      request.onupgradeneeded = (e) => {
        this._db = request.result;

        // create object store for schemas
        const schemaStore = this._db.createObjectStore("schemas", {
          keyPath: "name",
        });
        schemaStore.createIndex("name", "name", { unique: true });

        // store schemas in the database
        for (let key in this._models) {
          if (this._models.hasOwnProperty(key)) {
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
        this._db = request.result;
        this.version = this._db.version;

        // get schemas from database
        const transaction = this._db.transaction("schemas", "readonly");
        const schemaStore = transaction.objectStore("schemas");
        const schemaRequest = schemaStore.getAll();
        schemaRequest.onsuccess = (e) => {
          const schemas = schemaRequest.result;
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
        reject(request.error);
      };
    });
  }

  /**
   * Generates an object store for a model
   * @param {LeafstoreModel} model
   * @returns {void}
   */
  #generateObjectStore(model) {
    const { _objectStoreName: objectStoreName, _schema } = model;

    if (!this._db) throw new Error("Database is not connected");

    const objectStore = this._db.createObjectStore(objectStoreName, {
      keyPath: "_key",
    });
    // create indexes for object store fields
    this.#generateIndexes(objectStore, _schema);
  }

  /**
   * Generates indexes for an object store
   * @param {IDBObjectStore} objectStore - The object store to generate indexes for
   * @param {LeafstoreSchema} schema - The schema of the object store
   * @returns {void}
   */
  #generateIndexes(objectStore, schema) {
    const _schema = schema._schema;
    // flatten the object
    // don't flatten arrays
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

    const flattenedSchema = flatten(_schema);

    for (let key in flattenedSchema) {
      if (flattenedSchema.hasOwnProperty(key)) {
        const value = flattenedSchema[key];
        // create index for field if unique
        if (value?._unique) {
          objectStore.createIndex(key, key, { unique: true });
        }
      }
    }
  }

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
  static Schema(object, options = {}) {
    if (!object) throw new Error("schema object is required");
    if (typeof object !== "object")
      throw new Error("schema object must be of type 'object'");

    return new LeafstoreSchema(object, options);
  }

  /**
   * creates a leafstore model
   * @template {Record<string, any>} T
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

    // pluralise name for object store name
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

// module.exports = leafstore;
export default leafstore;
