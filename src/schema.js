/**
 * @typedef {Object} LeafstoreSchemaOptions
 */

/**
 * @template {Record<string, any>} T
 * @class
 */
class LeafstoreSchema {
  /**
   * Creates a Leafstore schema. This should not be called directly. Use {@link leafstore.Schema} instead.
   * @param {T} object - The template object used to generate the schema.
   * @param {LeafstoreSchemaOptions} options - Optional configuration for the schema.
   */
  constructor(object, options = {}) {
    this._rawSchema = object;
    this._schema = this.#generateSchema(object);
  }

  /**
   * Generates a schema from the given template object.
   * @param {Object} object - The template object used to generate the schema.
   * @param {string | undefined} [name] - The name of the object.
   * @returns {Object} The generated schema.
   */
  #generateSchema(object, name) {
    // TODO: check logic again
    let schema = {};
    // add key to schema if root object
    if (!name) {
      schema = {
        _key: {
          _type: "string",
          _validators: [],
        },
      };
    }
    for (let key in object) {
      if (key === "type") {
        const validators = this.#validators(object, name);
        const isUnique = object.unique;
        schema = {
          _type: object[key],
          _validators: validators,
          _unique: isUnique,
        };
      } else if (object.hasOwnProperty(key)) {
        const fieldProps = object[key];
        if (typeof fieldProps === "string") {
          schema[key] = {
            _type: fieldProps,
            _validators: [],
          };
        } else if (Array.isArray(fieldProps)) {
          schema[key] = {
            _type: "array",
            _schema: this.#generateSchema(fieldProps[0], key),
          };
        } else if (typeof fieldProps === "object") {
          schema[key] = this.#generateSchema(fieldProps, key);
        }
      }
    }
    return schema;
  }

  /**
   * Generates validators for a field.
   * @param {Object} fieldProps - The properties of the field.
   * @param {string} [name] - The name of the field.
   * @returns {Array<Function>} An array of validators.
   */
  #validators(fieldProps, name) {
    const { required, minLength, maxLength, minValue, maxValue } = fieldProps;

    const validators = [];

    const requiredValidator = (value) => {
      if (required && !value) throw new Error(`${name} is required`);
    };

    const minLengthValidator = (value) => {
      // validator format
      // minLength: 4 OR minLength: [4, "error message"]
      let message;
      if (Array.isArray(minLength)) {
        let [length, _message] = minLength;
        message = _message;
        if (typeof length !== "number")
          throw new Error(`Invalid minLength value for ${name}`);
        if (typeof message !== "string")
          message = `length of ${name} must be at least ${length}`;
      } else {
        if (typeof minLength !== "number")
          throw new Error(`Invalid minLength value for ${name}`);
        message = `length of ${name} must be at least ${minLength}`;
      }
      if (value?.length < minLength) throw new Error(message);
      return true;
    };

    const maxLengthValidator = (value) => {
      // validator format
      // maxLength: 4 OR maxLength: [4, "error message"]
      let message;
      if (Array.isArray(maxLength)) {
        let [length, _message] = maxLength;
        message = _message;
        if (typeof length !== "number")
          throw new Error(`Invalid maxLength value for ${name}`);
        if (typeof message !== "string")
          message = `Length of ${name} must be at most ${length}`;
      } else {
        if (typeof maxLength !== "number")
          throw new Error(`Invalid maxLength value for ${name}`);
        message = `Length of ${name} must be at most ${maxLength}`;
      }
      if (value?.length > maxLength) throw new Error(message);
      return true;
    };

    const minValueValidator = (value) => {
      // validator format
      // minValue: 4 OR minValue: [4, "error message"]
      let message;
      if (Array.isArray(minValue)) {
        let [value, _message] = minValue;
        message = _message;
        if (typeof value !== "number")
          throw new Error(`Invalid minValue value for ${name}`);
        if (typeof message !== "string")
          message = `${name} must be at least ${value}`;
      } else {
        if (typeof minValue !== "number")
          throw new Error(`Invalid minValue value for ${name}`);
        message = `${name} must be at least ${minValue}`;
      }
      if (value < minValue) throw new Error(message);
      return true;
    };

    const maxValueValidator = (value) => {
      // validator format
      // maxValue: 4 OR maxValue: [4, "error message"]
      let message;
      if (Array.isArray(maxValue)) {
        let [value, _message] = maxValue;
        message = _message;
        if (typeof value !== "number")
          throw new Error(`Invalid maxValue value for ${name}`);
        if (typeof message !== "string")
          message = `${name} must be at most ${value}`;
      } else {
        if (typeof maxValue !== "number")
          throw new Error(`Invalid maxValue value for ${name}`);
        message = `${name} must be at most ${maxValue}`;
      }
      if (value > maxValue) throw new Error(message);
      return true;
    };

    // add validators to array
    if (required) validators.push(requiredValidator);
    if (minLength && typeof minLength === "number")
      validators.push(minLengthValidator);
    if (maxLength && typeof maxLength === "number")
      validators.push(maxLengthValidator);
    if (minValue && typeof minValue === "number")
      validators.push(minValueValidator);
    if (maxValue && typeof maxValue === "number")
      validators.push(maxValueValidator);

    return validators;
  }

  /**
   * Validates an object against the schema.
   * @param {Object} object - The object to validate.
   * @returns {void}
   * @throws {Error} Throws an error if the object is invalid.
   */
  validate(object) {
    this.#validateObject(object, this._schema);
  }

  /**
   * Validates an object against the schema.
   * @param {Object} object - The object to validate.
   * @param {Object} schema - The schema to validate against.
   * @returns {void}
   * @throws {Error} Throws an error if the object is invalid.
   */
  #validateObject(object, schema) {
    // TODO: check logic again
    for (let key in schema) {
      if (schema.hasOwnProperty(key)) {
        const fieldProps = schema[key];
        if (fieldProps._type === "array") {
          if (!object[key]) object[key] = []; // default value for array
          if (Array.isArray(object[key])) {
            object[key].forEach((item) => {
              this.#validateObject(item, fieldProps._schema);
            });
          } else {
            throw new Error(`'${key}' must be an array`);
          }
        } else if (fieldProps._type === "object") {
          this.#validateObject(object[key], fieldProps);
        } else {
          fieldProps._validators?.forEach((validator) => {
            validator(object[key]);
          });
        }
      }
    }
  }

  /**
   * Casts an object to the schema.
   * @param {Object} object - The object to cast.
   * @returns {Object} The casted object.
   * @throws {Error} Throws an error if the object is invalid.
   */
  cast(object) {
    return this.#cast(object, this._schema);
  }

  /**
   * Casts an object to the schema.
   * @param {Object} object - The object to cast.
   * @param {Object} schema - The schema to cast against.
   * @returns {Object} The casted object.
   * @throws {Error} Throws an error if the object is invalid.
   */
  #cast(object, schema) {
    let result = {};
    for (let key in schema) {
      if (schema.hasOwnProperty(key)) {
        const fieldProps = schema[key];
        if (fieldProps._type === "array") {
          if (!object[key]) object[key] = []; // default value for array
          if (Array.isArray(object[key])) {
            result[key] = object[key].map((item) => {
              return this.#cast(item, fieldProps._schema);
            });
          } else {
            throw new Error(`'${key}' must be an array`);
          }
        } else if (fieldProps._type === "object") {
          result[key] = this.#cast(object[key], fieldProps);
        } else {
          result[key] = object[key];
        }
      }
    }
    return result;
  }
}

// module.exports = LeafstoreSchema;
export default LeafstoreSchema;
