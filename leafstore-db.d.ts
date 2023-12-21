declare module 'leafstore-db' {
  class LeafstoreDocument<T extends Record<string, any>> {
    constructor(
      object: T,
      model: LeafstoreModel<T>,
      isNew?: boolean | undefined
    );
    _object: T;
    _model: LeafstoreModel<T>;
    _isNew: boolean;
    toString(): string;
    toJSON(): Object;
    save(): Promise<LeafstoreDocument<T>>;
  }

  type LeafstoreModelConfig = {
    db?: IDBDatabase | null | undefined;
    objectStoreName?: string | null | undefined;
  };

  class LeafstoreModel<T extends Record<string, any>> {
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
    create(object: Object): Promise<LeafstoreDocument<T>>;
    insertOne(object: Object, key: string): Promise<LeafstoreDocument<T>>;
    findByKey(key: string): Promise<LeafstoreDocument<T> | null>;
    findOne(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<LeafstoreDocument<T> | null>;
    find(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<LeafstoreDocument<T>[]>;
    findByKeyAndDelete(key: string): Promise<void>;
    deleteOne(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<void>;
    deleteMany(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<void>;
    deleteAll(): Promise<void>;
    findByKeyAndUpdate(
      key: string,
      object: Object
    ): Promise<LeafstoreDocument<T>>;
    updateOne(
      query: Object | IDBValidKey | IDBKeyRange | null,
      object: Object
    ): Promise<LeafstoreDocument<T>>;
    updateMany(
      query: Object | IDBValidKey | IDBKeyRange | null,
      object: Object
    ): Promise<LeafstoreDocument<T>[]>;
    count(
      query?: Object | IDBValidKey | IDBKeyRange | null | undefined
    ): Promise<number>;
  }

  type LeafstoreSchemaOptions = Object;

  class LeafstoreSchema<T extends Record<string, any>> {
    constructor(object: T, options?: LeafstoreSchemaOptions);
    _rawSchema: T;
    _schema: Object;
    validate(object: Object): void;
    cast(object: Object): Object;
  }
}
