export default LeafstoreSchema;
export type LeafstoreSchemaOptions = Object;
/**
 * @typedef {Object} LeafstoreSchemaOptions
 */
/**
 * @template {Record<string, any>} T
 * @class
 */
declare class LeafstoreSchema<T extends Record<string, any>> {
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
    #private;
}
//# sourceMappingURL=schema.d.ts.map