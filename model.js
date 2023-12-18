const LeafstoreSchema = require("./schema.js");
const LeafstoreDocument = require("./document.js");

/**
 * @typedef {Object} LeafstoreModelConfig
 * @property {IDBDatabase} db - The database to use.
 * @property {String} objectStoreName - The name of the object store.
 */

/**
 * @template T
 */
class LeafstoreModel {
  /**
   * Creates a leafstore model
   * @param {String} name
   * @param {LeafstoreSchema<T>} schema
   * @param {LeafstoreModelConfig} config - optional
   * @returns {LeafstoreModel<T>}
   */
  constructor(
    name,
    schema,
    config = {
      db: null,
      objectStoreName: null,
    }
  ) {
    this.name = name;
    this._schema = schema;
    this._db = config.db;
    this._objectStoreName = config.objectStoreName || name.toLowerCase();
  }

  /**
   * Creates a new document
   * @param {Object} object
   * @returns {Promise<LeafstoreDocument>}
   */
  async create(object) {
    // wait for the database to connect
    return new Promise((resolve, reject) => {
      try {
        this._schema.validate(object);
        object = this._schema.cast(object);
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.add(object, object[this._schema.key]);
        request.onsuccess = (e) => {
          const key = e.target.result;
          resolve(
            new LeafstoreDocument(
              {
                ...object,
                _key: key,
              },
              this,
              false
            )
          );
        };
        request.onerror = (e) => {
          reject(e.target.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Finds a document by its primary key
   * @param {String} key
   * @returns {Promise<LeafstoreDocument>}
   */
  async findByKey(key) {
    return new Promise((resolve, reject) => {
      const transaction = this._db.transaction(
        this._objectStoreName,
        "readonly"
      );
      const objectStore = transaction.objectStore(this._objectStoreName);
      const request = objectStore.get(key);
      request.onsuccess = (e) => {
        const result = e.target.result;
        if (result) {
          resolve(
            new LeafstoreDocument(
              {
                ...result,
                _key: key,
              },
              this,
              false
            )
          );
        } else {
          resolve(null);
        }
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Finds all documents
   * @returns {Promise<LeafstoreDocument[]>}
   */
  async findAll() {
    return new Promise((resolve, reject) => {
      const transaction = this._db.transaction(
        this._objectStoreName,
        "readonly"
      );
      const objectStore = transaction.objectStore(this._objectStoreName);
      const request = objectStore.getAll();
      request.onsuccess = (e) => {
        const result = e.target.result;
        if (result) {
          resolve(
            result.map((object) => new LeafstoreDocument(object, this, false))
          );
        } else {
          resolve([]);
        }
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Finds the first document matching the query.
   * If no query is provided, the first document to come up is returned.
   * Order is not guaranteed.
   * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
   * @returns {Promise<LeafstoreDocument>}
   */
  async findOne(query) {
    return new Promise((resolve, reject) => {
      // Optimisation for primary key queries
      let objectStoreName = this._objectStoreName;
      if (
        Object.keys(query).find((key) => key === this._schema.primaryKeyPath)
      ) {
        objectStoreName = this._schema.primaryKeyPath;
      }
      let idbQuery = null;
      if (typeof query === "string") {
        idbQuery = query;
      }
      // optimisation ends
      const transaction = this._db.transaction(objectStoreName, "readonly");
      const objectStore = transaction.objectStore(this._objectStoreName);
      const request = objectStore.getAll(idbQuery);
      request.onsuccess = (e) => {
        const result = e.target.result;
        if (result) {
          const documents = this.#parseQuery(query, result);
          resolve(
            documents.length
              ? new LeafstoreDocument(documents[0], this, false)
              : null
          );
        } else {
          resolve(null);
        }
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Finds all documents matching the query
   * if no query is provided, all documents are returned
   * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
   * @returns {Promise<LeafstoreDocument[]>}
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
  async find(query) {
    return new Promise((resolve, reject) => {
      // Optimisation for primary key queries
      let objectStoreName = this._objectStoreName;
      if (
        Object.keys(query).find((key) => key === this._schema.primaryKeyPath)
      ) {
        objectStoreName = this._schema.primaryKeyPath;
      }
      let idbQuery = null;
      if (typeof query === "string") {
        idbQuery = query;
      }
      // optimisation ends
      const transaction = this._db.transaction(objectStoreName, "readonly");
      const objectStore = transaction.objectStore(this._objectStoreName);
      const request = objectStore.getAll(idbQuery);
      request.onsuccess = (e) => {
        const result = e.target.result;
        if (result) {
          const documents = this.#parseQuery(query, result);
          resolve(
            documents.map(
              (object) => new LeafstoreDocument(object, this, false)
            )
          );
        } else {
          resolve([]);
        }
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Deletes a document by its primary key
   * @param {String} key
   * @returns {Promise<void>}
   */
  async findByKeyAndDelete(key) {
    return new Promise((resolve, reject) => {
      const transaction = this._db.transaction(
        this._objectStoreName,
        "readwrite"
      );
      const objectStore = transaction.objectStore(this._objectStoreName);
      const request = objectStore.delete(key);
      request.onsuccess = (e) => {
        resolve();
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Deletes all documents
   * @returns {Promise<void>}
   */
  async deleteAll() {
    return new Promise((resolve, reject) => {
      const transaction = this._db.transaction(
        this._objectStoreName,
        "readwrite"
      );
      const objectStore = transaction.objectStore(this._objectStoreName);
      const request = objectStore.clear();
      request.onsuccess = (e) => {
        resolve();
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * Updates a document by its primary key
   * @param {String} key
   * @param {Object} object
   * @returns {Promise<LeafstoreDocument>}
   */
  async findByKeyAndUpdate(key, object) {
    return new Promise((resolve, reject) => {
      try {
        this._schema.validate(object);
        object = this._schema.cast(object);
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.put(object, key);
        request.onsuccess = (e) => {
          resolve(new LeafstoreDocument(object, this, false));
        };
        request.onerror = (e) => {
          reject(e.target.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Counts the number of documents matching the query
   * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
   * @returns {Promise<Number>}
   */
  async count(query) {
    return new Promise((resolve, reject) => {
      // Optimisation for primary key queries
      let objectStoreName = this._objectStoreName;
      if (
        Object.keys(query).find((key) => key === this._schema.primaryKeyPath)
      ) {
        objectStoreName = this._schema.primaryKeyPath;
      }
      let idbQuery = null;
      if (typeof query === "string") {
        idbQuery = query;
      }
      // optimisation ends
      const transaction = this._db.transaction(objectStoreName, "readonly");
      const objectStore = transaction.objectStore(this._objectStoreName);
      const request = objectStore.getAll(idbQuery);
      request.onsuccess = (e) => {
        const result = e.target.result;
        if (result) {
          const documents = this.#parseQuery(query, result);
          resolve(documents.length);
        } else {
          resolve(0);
        }
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  /**
   * filters documents by a query
   * @param {Object} query
   * @param {List<Object>} documents
   * @returns {List<Object>}
   */
  #parseQuery(query, documents) {
    const supportedOperators = [
      ["$eq", (a, b) => a === b],
      ["$gt", (a, b) => a > b],
      ["$gte", (a, b) => a >= b],
      ["$lt", (a, b) => a < b],
      ["$lte", (a, b) => a <= b],
      ["$in", (a, b) => b.includes(a)],
      ["$nin", (a, b) => !b.includes(a)],
      ["$ne", (a, b) => a !== b],
      ["$regex", (a, b) => b.test(a)],
    ];

    return documents.filter((document) => {
      for (let key in query) {
        if (query.hasOwnProperty(key)) {
          if (!document.hasOwnProperty(key)) return false;
          if (typeof query[key] === "object") {
            for (let op in query[key]) {
              if (query[key].hasOwnProperty(op)) {
                const [operatorName, operatorFunc] =
                  supportedOperators.find((operator) => operator[0] === op) ||
                  [];
                if (!operatorName) {
                  throw new Error(`Operator '${op}' is not supported`);
                }
                if (!operatorFunc(document[key], query[key][op])) {
                  return false;
                }
              } else {
                return false;
              }
            }
          } else {
            if (document[key] !== query[key]) return false;
          }
        }
      }
      return true;
    });
  }
}

module.exports = LeafstoreModel;
