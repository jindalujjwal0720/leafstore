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

// Connect to the database
try {
  await db.connect({
    version: 1,
    onUpgrade: (event) => {
      // Do something when the database is upgraded
    },
  });
  console.log("Connected to the database");
} catch (error) {
  console.log(error);
}

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

#### leafstore.connect(options)

- `options` - The options for the database
  - `version` - The version of the database
  - `onUpgrade` - The callback function to be called when the database is upgraded

#### db.Model(name, schema)

- `name` - The name of the model
- `schema` - The schema of the model

Creates a new model with the given name and schema.

#### leafstore.Schema(object)

- `object` - The schema template of the model

Creates a new schema with the given schema.

### LeafstoreModel

#### LeafstoreModel.create(object)

- `object` - The object to be inserted

Inserts the given object into the collection.

#### LeafstoreModel.insertOne(object)

- `object` - The object to be inserted

Inserts the given object into the collection. If the object already exists, it will update the object.

#### LeafstoreModel.findByKey(key)

- `key` - The key to be searched

Searches the collection for the given key and returns the result.

#### LeafstoreModel.find(query)

- `query` - The query to be executed

Executes the given query and returns all the matching results.

#### LeafstoreModel.findOne(query)

- `query` - The query to be executed

Executes the given query and returns the first matching result.

#### LeafstoreModel.findByKeyAndUpdate(key, update)

- `key` - The unique key to be searched
- `update` - The update to be applied

Searches the collection for the given key and updates the document with the given update.

#### LeafstoreModel.updateOne(query, update)

- `query` - The query to be executed
- `update` - The update to be applied

Executes the given query and updates the first matching document with the given update.

#### LeafstoreModel.updateMany(query, update)

- `query` - The query to be executed
- `update` - The update to be applied

Executes the given query and updates all the matching documents with the given update.

#### LeafstoreModel.findByKeyAndDelete(key)

- `key` - The unique key to be searched

Searches the collection for the given key and deletes the document.

#### LeafstoreModel.deleteOne(query)

- `query` - The query to be executed

Executes the given query and deletes the first matching document.

#### LeafstoreModel.deleteMany(query)

- `query` - The query to be executed

Executes the given query and deletes all the matching documents.

#### LeafstoreModel.deleteAll()

Deletes all the documents in the collection. Be careful while using this method.

#### LeafstoreModel.count(query)

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

#### LeafstoreSchema.validate(object)

- `object` - The object to be validated (internal use)

Validates the given object against the schema.

#### LeafstoreSchema.cast(object)

- `object` - The object to be casted. (internal use)

Casts the given object against the schema.

### LeafstoreDocument

#### LeafstoreDocument.save()

Saves the document to the collection. If the document already exists, it will update the document.

#### LeafstoreDocument.toJSON()

Returns the JSON representation of the document.

#### LeafstoreDocument.toString()

Returns the string representation of the document.

## License

[MIT &copy; Ujjwal Jindal - 2023](https://choosealicense.com/licenses/mit/)
