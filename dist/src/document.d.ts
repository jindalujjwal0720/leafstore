export default LeafstoreDocument;
/**
 * @template {Record<string, any>} T
 * @class
 */
declare class LeafstoreDocument<T extends Record<string, any>> {
    /**
     * Creates a Leafstore document. This class is not meant to be instantiated directly.
     * {@link LeafstoreModel} will call this class automatically for you.
     *
     * @param {T} object
     * @param {LeafstoreModel<T>} model
     * @param {Boolean} [isNew=true]
     */
    constructor(object: T, model: LeafstoreModel<T>, isNew?: boolean | undefined);
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
    #private;
}
import LeafstoreModel from "./model.js";
//# sourceMappingURL=document.d.ts.map