const LeafstoreModel = require("./model");

/**
 * @typedef {Object} LeafstoreDocumentOptions
 * @property {boolean} isNew - Indicates whether the document is new.
 */

/**
 * @template T
 * @class
 */
class LeafstoreDocument {
  /**
   * Creates a Leafstore document. This class is not meant to be instantiated directly.
   * {@link LeafstoreModel} will call this class automatically for you.
   *
   * @param {T} object
   * @param {LeafstoreModel<T>} model
   * @param {LeafstoreDocumentOptions} [options]
   * @returns {LeafstoreDocument<T>}
   */
  constructor(object, model, isNew = true) {
    this._object = object;
    this._model = model;
    this._isNew = isNew;
    this._key = object._key;

    // add fields to document
    // for (let key in object) {
    //   if (object.hasOwnProperty(key)) {
    //     this[key] = object[key];
    //   }
    // }

    this.#addGettersAndSetters();
  }

  /**
   * @private
   * Adds getters and setters to the document
   */
  #addGettersAndSetters() {
    /** @type {Record<keyof T, any>} */
    const schema = this._model._schema._schema;

    for (let key in schema) {
      if (this._object.hasOwnProperty(key)) {
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
   * @override
   * @returns {String}
   */
  toString() {
    return JSON.stringify(this._object);
  }

  /**
   * @override
   * @returns {Object}
   */
  toJSON() {
    return this._object;
  }

  /**
   * Saves the document to the database
   * @returns {Promise<LeafstoreDocument>}
   */
  async save() {
    if (!this._isNew) {
      return this;
    }
    return new Promise((resolve, reject) => {
      try {
        this._model
          .findByKeyAndUpdate(this._model._schema.primaryKeyPath, this._object)
          .then((document) => {
            this._object = document._object;
            this._isNew = false;
            resolve(this);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = LeafstoreDocument;
