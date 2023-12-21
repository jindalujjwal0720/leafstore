// const LeafstoreSchema = require("./schema.js");
// const LeafstoreDocument = require("./document.js");
import LeafstoreSchema from "./schema.js";
import LeafstoreDocument from "./document.js";

/**
 * @typedef {Object} LeafstoreModelConfig
 * @property {IDBDatabase | null} [db] - The database to use.
 * @property {String | null} [objectStoreName] - The name of the object store.
 */

/**
 * @template {Record<string, any>} T
 * @class
 */
class LeafstoreModel {
  /**
   * Creates a leafstore model
   * @param {String} name
   * @param {LeafstoreSchema<T>} schema
   * @param {LeafstoreModelConfig} config - optional
   */
  constructor(
    name,
    schema,
    config = {
      db: null,
      objectStoreName: null,
    }
  ) {
    if (!name) throw new Error("Name is required");
    if (typeof name !== "string") throw new Error("Name must be a string");
    if (!schema) throw new Error("Schema is required");
    if (!(schema instanceof LeafstoreSchema)) {
      throw new Error("schema must be an instance of LeafstoreSchema");
    }
    this.name = name;
    this._schema = schema;
    this._db = config.db;
    this._objectStoreName = config.objectStoreName || name.toLowerCase();
    this._deletedKeys = []; // keys of deleted documents - acts as a cache until the document is actually deleted
  }

  /**
   * Creates a new document
   * @param {Object} object
   * @returns {Promise<LeafstoreDocument<T>>}
   */
  async create(object) {
    // wait for the database to connect
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");
        // validate and cast object
        this._schema.validate(object);
        object = this._schema.cast(object);
        // add unique key to object
        this.#addUniqueKey(object);
        // create object
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.add(object);
        request.onsuccess = (e) => {
          resolve(new LeafstoreDocument(object, this, false));
        };
        request.onerror = (e) => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Inserts a document. If the document already exists, it is updated.
   * @param {Object} object
   * @param {String} key
   * @returns {Promise<LeafstoreDocument<T>>}
   */
  async insertOne(object, key) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");
        // validate and cast object
        this._schema.validate(object);
        object = this._schema.cast(object);
        // add unique key to object if not provided
        // it means the object is new
        if (!key && !object._key) {
          this.#addUniqueKey(object);
          key = object._key;
        }
        // create object
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.put(object);
        request.onsuccess = (e) => {
          resolve(new LeafstoreDocument(object, this, false));
        };
        request.onerror = (e) => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Finds a document by its primary key
   * @param {String} key
   * @returns {Promise<LeafstoreDocument<T> | null>}
   */
  async findByKey(key) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        if (!key) throw new Error("Key is required");
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readonly"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.get(key);
        request.onsuccess = (e) => {
          let result = request.result;
          if (result) {
            [result] = this.#filterDeleted([result]);
            if (result) {
              return resolve(new LeafstoreDocument(result, this, false));
            }
          }
          resolve(null);
        };
        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Finds the first document matching the query.
   * If no query is provided, the first document to come up is returned.
   * Order is not guaranteed.
   * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
   * @returns {Promise<LeafstoreDocument<T> | null>}
   */
  async findOne(query) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        // Optimisation for primary key queries
        let objectStoreName = this._objectStoreName;
        let idbQuery = null;
        if (typeof query === "string") {
          idbQuery = query;
        }
        // optimisation ends
        const transaction = this._db.transaction(objectStoreName, "readonly");
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.getAll(idbQuery);
        request.onsuccess = (e) => {
          const result = request.result;
          if (result) {
            const document = this.#parseQuery(query, result, true);
            if (document) {
              resolve(new LeafstoreDocument(document, this, false));
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        request.onerror = (e) => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

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
  async find(query) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        // Optimisation for primary key queries
        let objectStoreName = this._objectStoreName;
        let idbQuery = null;
        if (typeof query === "string") {
          idbQuery = query;
        }
        // optimisation ends
        const transaction = this._db.transaction(objectStoreName, "readonly");
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.getAll(idbQuery);
        request.onsuccess = (e) => {
          const result = request.result;
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
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes a document by its primary key
   * @param {String} key
   * @returns {Promise<void>}
   */
  async findByKeyAndDelete(key) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        if (!key) throw new Error("Key is required");
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.delete(key);
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes the first document matching the query
   * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
   * @returns {Promise<void>}
   */
  async deleteOne(query) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        // Optimisation for primary key queries
        let objectStoreName = this._objectStoreName;
        let idbQuery = null;
        if (typeof query === "string") {
          idbQuery = query;
        }
        // optimisation ends
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.getAll(idbQuery);
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            const document = this.#parseQuery(query, result, true);
            if (document) {
              const key = document._key;
              // delete document
              this.#deleteByKey(key);
            }
          }
          resolve();
        };
        request.onerror = () => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes all documents matching the query
   * @param {Object | IDBValidKey | IDBKeyRange | null} [query] - The query to match.
   * @returns {Promise<void>}
   */
  async deleteMany(query) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        // Optimisation for primary key queries
        let objectStoreName = this._objectStoreName;
        let idbQuery = null;
        if (typeof query === "string") {
          idbQuery = query;
        }
        // optimisation ends
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.getAll(idbQuery);
        request.onsuccess = (e) => {
          const result = request.result;
          if (result) {
            const documents = this.#parseQuery(query, result);
            const keys = documents.map((document) => document._key);
            // delete documents
            this.#deleteByKeys(keys);
          }
          resolve();
        };
        request.onerror = (e) => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes all documents
   * @returns {Promise<void>}
   */
  async deleteAll() {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

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
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Updates a document by its primary key
   * @param {String} key
   * @param {Object} object
   * @returns {Promise<LeafstoreDocument<T>>}
   */
  async findByKeyAndUpdate(key, object) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        if (!key) throw new Error("Key is required");
        if (!object) throw new Error("update object is required");
        if (typeof object !== "object") {
          throw new Error("update object must be an object");
        }
        // get original object
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.get(key);
        request.onsuccess = (e) => {
          let result = request.result;
          [result] = this.#filterDeleted([result]);
          if (result) {
            let updatedObject = {
              ...result,
              ...(object || {}),
            };
            // validate and cast updated object
            this._schema.validate(updatedObject);
            updatedObject = this._schema.cast(updatedObject);
            // add original key to object
            updatedObject._key = key;
            // update object
            // no need to pass key since it is already in the object
            // MDN: If the object store uses in-line keys and key is specified,
            // DataError is thrown.
            const updateRequest = objectStore.put(updatedObject);
            updateRequest.onsuccess = () => {
              resolve(new LeafstoreDocument(updatedObject, this, false));
            };
            updateRequest.onerror = () => {
              reject(updateRequest.error);
            };
          } else {
            reject(new Error(`No document found with key '${key}'`));
          }
          resolve(new LeafstoreDocument(object, this, false));
        };
        request.onerror = (e) => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Updates the first document matching the query
   * @param {Object | IDBValidKey | IDBKeyRange | null} query - The query to match.
   * @param {Object} object
   * @returns {Promise<LeafstoreDocument<T>>}
   */
  async updateOne(query, object) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        if (!object) throw new Error("update object is required");
        if (typeof object !== "object") {
          throw new Error("update object must be an object");
        }
        // Optimisation for primary key queries
        let objectStoreName = this._objectStoreName;
        let idbQuery = null;
        if (typeof query === "string") {
          idbQuery = query;
        }
        // optimisation ends
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.getAll(idbQuery);
        request.onsuccess = (e) => {
          const result = request.result;
          if (result) {
            const document = this.#parseQuery(query, result, true);
            if (document) {
              const key = document._key;
              let updatedObject = {
                ...document,
                ...(object || {}),
              };
              // validate and cast updated object
              this._schema.validate(updatedObject);
              updatedObject = this._schema.cast(updatedObject);
              // add original key to object
              updatedObject._key = key;
              // update object
              // no need to pass key since it is already in the object
              // MDN: If the object store uses in-line keys and key is specified,
              // DataError is thrown.
              const updateRequest = objectStore.put(updatedObject);
              updateRequest.onsuccess = () => {
                resolve(new LeafstoreDocument(updatedObject, this, false));
              };
              updateRequest.onerror = () => {
                reject(updateRequest.error);
              };
            } else {
              reject(
                new Error(`No document found with query '${query?.toString()}'`)
              );
            }
          } else {
            reject(
              new Error(`No document found with query '${query?.toString()}'`)
            );
          }
        };
        request.onerror = (e) => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Updates all documents matching the query
   * @param {Object | IDBValidKey | IDBKeyRange | null} query - The query to match.
   * @param {Object} object
   * @returns {Promise<LeafstoreDocument<T>[]>}
   */
  async updateMany(query, object) {
    return new Promise((resolve, reject) => {
      try {
        if (!this._db) throw new Error("Database is not connected");

        if (!object) throw new Error("update object is required");
        if (typeof object !== "object") {
          throw new Error("update object must be an object");
        }
        // Optimisation for primary key queries
        let objectStoreName = this._objectStoreName;
        let idbQuery = null;
        if (typeof query === "string") {
          idbQuery = query;
        }
        // optimisation ends
        const transaction = this._db.transaction(
          this._objectStoreName,
          "readwrite"
        );
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.getAll(idbQuery);
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            const documents = this.#parseQuery(query, result);
            // update documents
            documents.forEach((document) => {
              let updatedObject = {
                ...document,
                ...(object || {}),
              };
              // validate and cast updated object
              this._schema.validate(updatedObject);
              updatedObject = this._schema.cast(updatedObject);
              // add original key to object
              updatedObject._key = document._key;
              // update object
              // no need to pass key since it is already in the object
              // MDN: If the object store uses in-line keys and key is specified,
              // DataError is thrown.
              const updateRequest = objectStore.put(updatedObject);
              updateRequest.onsuccess = () => {
                resolve(
                  documents.map(
                    (object) => new LeafstoreDocument(object, this, false)
                  )
                );
              };
              updateRequest.onerror = () => {
                reject(updateRequest.error);
              };
            });
          } else {
            resolve([]);
          }
        };
        request.onerror = (e) => {
          reject(request.error);
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
      try {
        if (!this._db) throw new Error("Database is not connected");

        // Optimisation for primary key queries
        let objectStoreName = this._objectStoreName;
        let idbQuery = null;
        if (typeof query === "string") {
          idbQuery = query;
        }
        // optimisation ends
        const transaction = this._db.transaction(objectStoreName, "readonly");
        const objectStore = transaction.objectStore(this._objectStoreName);
        const request = objectStore.getAll(idbQuery);
        request.onsuccess = (e) => {
          const result = request.result;
          if (result) {
            const documents = this.#parseQuery(query, result);
            resolve(documents.length);
          } else {
            resolve(0);
          }
        };
        request.onerror = (e) => {
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * filters documents by a query.
   * Also filters deleted documents
   * @param {Object} query - The query to match
   * @param {Object[]} documents - The documents to filter
   * @param {Boolean} [returnOne=false] - Whether to return on first match
   * @returns {Object[] | Object | null}
   */
  #parseQuery(query, documents, returnOne = false) {
    if (!query) return documents;

    documents = this.#filterDeleted(documents);

    /**
     * @type {[String, Function][]}
     */
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

    const doesMatch = (document) => {
      for (let key in query) {
        if (query.hasOwnProperty(key)) {
          if (!document.hasOwnProperty(key)) return false;
          if (typeof query[key] === "object") {
            for (let op in query[key]) {
              if (query[key].hasOwnProperty(op)) {
                const [operatorName, operatorFunc] = supportedOperators.find(
                  (operator) => operator[0] === op
                ) || [null, () => false];
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
    };

    if (returnOne) {
      return documents.find(doesMatch);
    }
    return documents.filter(doesMatch);
  }

  /**
   * Adds a unique key to an object
   * @param {Object} object
   * @returns {void}
   */
  #addUniqueKey(object) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    let key = `${timestamp}${random}`;
    object["_key"] = key;
  }

  /**
   * Adds meta data to an object
   * @param {Object} object
   * @returns {void}
   */
  #addMetaData(object) {
    // TODO: add meta data as per need
    // currently not in use
  }

  /**
   * Deletes multiple documents by their primary keys from the database.
   * Non blocking. Uses a cache to store deleted keys.
   * @param {String[]} keys
   */
  #deleteByKeys(keys) {
    if (!keys) return;
    try {
      keys.forEach((key) => {
        // timeout to make it non blocking
        setTimeout(() => {
          this.#deleteByKey(key);
        }, 0);
      });
    } catch (error) {
      // do nothing
    }
  }

  /**
   * Deletes a document by its primary key from the database.
   * Non blocking. Uses a cache to store deleted keys.
   * @param {String} key
   */
  #deleteByKey(key) {
    if (!key) return;
    try {
      if (!this._db) throw new Error("Database is not connected");

      const transaction = this._db.transaction(
        this._objectStoreName,
        "readwrite"
      );
      const objectStore = transaction.objectStore(this._objectStoreName);
      const request = objectStore.delete(key);
      request.onsuccess = (e) => {
        // remove key from cache
        this._deletedKeys = this._deletedKeys.filter((k) => k !== key);
      };
      request.onerror = (e) => {
        // do nothing
      };
    } catch (error) {
      // do nothing
    }
  }

  /**
   * Filters deleted documents from a list of documents.
   * @param {Object[]} documents
   * @returns {Object[]}
   */
  #filterDeleted(documents) {
    return documents.filter((document) => {
      return !this._deletedKeys.includes(document?._key);
    });
  }
}

// module.exports = LeafstoreModel;
export default LeafstoreModel;
