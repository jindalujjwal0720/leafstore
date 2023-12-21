// const LeafstoreModel = require("./model");
import LeafstoreModel from "./model.js";

/**
 * @template {Record<string, any>} T
 * @class
 */
class LeafstoreDocument {
  /**
   * Creates a Leafstore document. This class is not meant to be instantiated directly.
   * {@link LeafstoreModel} will call this class automatically for you.
   *
   * @param {T} object
   * @param {LeafstoreModel<T>} model
   * @param {Boolean} [isNew=true]
   */
  constructor(object, model, isNew = true) {
    this._object = object;
    this._model = model;
    this._isNew = isNew;

    this.#addGettersAndSetters();
  }

  /**
   * Adds getters and setters to the document
   */
  #addGettersAndSetters() {
    /** @type {Record<keyof T, any>} */
    const schema = this._model._schema._schema;
    const privateFields = ["_key"];

    for (let key in schema) {
      if (this._object.hasOwnProperty(key)) {
        // add only getters for private fields
        if (privateFields.includes(key)) {
          Object.defineProperty(this, key, {
            get() {
              return this._object[key];
            },
          });
          continue;
        }
        // add getters and setters
        Object.defineProperty(this, key, {
          get() {
            return this._object[key];
          },
          set(value) {
            this._isNew = true;
            this._object[key] = value;
          },
        });
      }
    }
  }

  /**
   * @returns {String}
   */
  toString() {
    return JSON.stringify(this._object);
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return this._object;
  }

  /**
   * Saves the document to the database. If the document is new, it will be created.
   * @returns {Promise<LeafstoreDocument<T>>}
   */
  async save() {
    if (!this._isNew) {
      return this;
    }
    return new Promise((resolve, reject) => {
      try {
        this._model.insertOne(this._object, this._object._key).then((document) => {
          this._object = document._object;
          this._isNew = false;
          resolve(this);
        }).catch((error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// module.exports = LeafstoreDocument;
export default LeafstoreDocument;
