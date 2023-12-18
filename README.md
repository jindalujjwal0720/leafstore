# Leafstore - A simple wrapper for the IndexedDB API

Leafstore is a simple wrapper for the IndexedDB API. It provides a simple interface for storing and retrieving data from IndexedDB. Leafstore is written in JavaScript and is compatible with all modern browsers. It also has js doc comments for all methods and properties.

Leafstore has simple and most useful methods for querying data with advanced and fast in-memory filtering. It has a similar syntax to mongoose and mongodb.

## Features

- Simple and easy to use
- Fast in-memory filtering
- Supports advanced deep object queries
- Similar syntax to mongoose and mongodb
- Supports all modern browsers
- Fully typed with js doc comments

## Installation

```bash
npm install leafstore-db
```

## Usage

```javascript
import leafstore from "leafstore-db";
const db = new leafstore("databaseName");

// Create a schema for the database
const userSchema = {
  name: leafstore.SchemaTypes.String,
  age: leafstore.SchemaTypes.Number,
  email: leafstore.SchemaTypes.String,
  address: {
    city: leafstore.SchemaTypes.String,
    state: leafstore.SchemaTypes.String,
    country: leafstore.SchemaTypes.String,
  },
};

// Create a model
const User = db.Model("User", userSchema);

// Create a document
const userObject = {
  name: "John Doe",
  age: 25,
  email: "john@doe.com",
  address: {
    city: "New York",
    state: "New York",
    country: "USA",
  },
};

// Insert the document
await User.create(userObject);

// Find the document
const user = await User.findOne({ name: "John Doe" });
```

## API

### leafstore

#### leafstore(name)

- `name` - The name of the database

Creates a new database with the given name.

#### leafstore.SchemaTypes

- `String` - String type
- `Number` - Number type
- `Boolean` - Boolean type
- `Date` - Date type
- `Array` - Array type
- `Object` - Object type

#### leafstore.prototype.connect(options)

- `options` - The options for the database
  - `version` - The version of the database
  - `onUpgrade` - The callback function to be called when the database is upgraded

#### leafstore.prototype.Model(name, schema)

- `name` - The name of the model
- `schema` - The schema of the model

Creates a new model with the given name and schema.

#### leafstore.prototype.Schema(schema)

- `schema` - The schema template of the model

Creates a new schema with the given schema.

### LeafstoreModel

#### LeafstoreModel.prototype.create(object)

- `object` - The object to be inserted

Inserts the given object into the collection.

#### LeafstoreModel.prototype.findByKey(key)

- `key` - The key to be searched

Searches the collection for the given key and returns the result.

#### LeafstoreModel.prototype.find(query)

- `query` - The query to be executed

Executes the given query and returns the result.

#### LeafstoreModel.prototype.findOne(query)

- `query` - The query to be executed

Executes the given query and returns the first result.

#### LeafstoreModel.prototype.findAll()

Returns all the documents in the collection.

#### LeafstoreModel.prototype.findByKeyAndUpdate(key, update)

- `key` - The key to be searched
- `update` - The update to be applied

Searches the collection for the given key and updates the document with the given update.

#### LeafstoreModel.prototype.findByKeyAndDelete(key)

- `key` - The key to be searched

Searches the collection for the given key and deletes the document.

#### LeafstoreModel.prototype.deleteAll()

Deletes all the documents in the collection. Be careful while using this method.

#### LeafstoreModel.prototype.count(query)

- `query` - The query to be executed

Executes the given query and returns the count of the documents matching the query.

#### `query` methods

- `$eq` - Matches values that are equal to a specified value.
- `$gt` - Matches values that are greater than a specified value.
- `$gte` - Matches values that are greater than or equal to a specified value.
- `$in` - Matches any of the values specified in an array.
- `$lt` - Matches values that are less than a specified value.
- `$lte` - Matches values that are less than or equal to a specified value.
- `$ne` - Matches all values that are not equal to a specified value.
- `$nin` - Matches none of the values specified in an array.
- `$regex` - Provides regular expression capabilities for pattern matching strings in queries.

### LeafstoreSchema

#### Validators

- `required` - Checks if the value is present
- `minValue` - Checks if the value is greater than or equal to the given value
- `maxValue` - Checks if the value is less than or equal to the given value
- `minLength` - Checks if the length of the value is greater than or equal to the given value
- `maxLength` - Checks if the length of the value is less than or equal to the given value

#### LeafstoreSchema.prototype.validate(object)

- `object` - The object to be validated (internal use)

Validates the given object against the schema.

#### LeafstoreSchema.prototype.cast(object)

- `object` - The object to be casted. (internal use)

Casts the given object against the schema.

### LeafstoreDocument

#### LeafstoreDocument.prototype.save()

`Unstable` - Saves the document to the collection. This method is unstable and may not work as expected. Use `LeafstoreModel.prototype.create` instead.

#### LeafstoreDocument.prototype.toJSON()

Returns the JSON representation of the document.

#### LeafstoreDocument.prototype.toString()

Returns the string representation of the document.

## License

[MIT &copy; Ujjwal Jindal - 2023](https://choosealicense.com/licenses/mit/)
