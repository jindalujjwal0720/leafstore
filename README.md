# Leafstore - A simple wrapper for the IndexedDB API

Leafstore is a simple wrapper for the IndexedDB API. It provides a simple interface for storing and retrieving data from IndexedDB. Leafstore is written in JavaScript and is compatible with all modern browsers. It also has js doc comments for all methods and properties.

Leafstore has simple and most useful methods for querying data with advanced and fast in-memory filtering. It has a similar syntax to mongoose and mongodb.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage Example](#usage-example)
- [Performance Metrics](#performance-metrics)
  - [Throughput (in dps)](#throughput-in-dps)
  - [Time taken (in milliseconds)](#time-taken-in-milliseconds)
  - [Test Environment](#test-environment)
- [Documentation](#documentation)
- [License](#license)

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

## Usage Example

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
    onUpgrade: (db) => {
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

## Performance Metrics

### Throughput (in dps)

`dps` - Documents per second

- Dataset size: 100, Document size: 150 bytes

  - `create` - 260 dps
  - `insertOne` - 220 dps
  - `count` - 25,000 dps
  - `find` - 30,000 dps
  - `updateOne` - 150 dps
  - `updateMany` - 10,000 dps
  - `deleteOne` - 160 dps
  - `deleteMany` - 15,000 dps

- Dataset size: 1000, Document size: 150 bytes
  - `create` - 280 dps
  - `insertOne` - 500 dps
  - `count` - 90,000 dps
  - `find` - 1,25,000 dps
  - `updateOne` - 100 dps
  - `updateMany` - 25,000 dps
  - `deleteOne` - 100 dps
  - `deleteMany` - 20,000 dps

### Time taken (in milliseconds)

![Performance Metrics](https://lh3.googleusercontent.com/pw/ABLVV86Y0ALf_iCFGCaHW1b0iMR4Mw_jMYNbrpKv5gritK9NYRC5EBkxxrZIjSgO4KrzEzNq8GLXmhLN5G-eLmIHXphSkMbOucytuns8eW_8YXUZQK9YbfENAoHqWEWkC9QSROdch8C3in03EuxgytPEV3XIMA=w1024-h546-s-no-gm?authuser=0)

### Test Environment

- Processor: Intel(R) Core(TM) i7-9750HF CPU @2.60GHz 2.59 GHz
- Installed RAM: 8.0 GB
- System type: 64-bit operating system, x64-based processor
- Browser: Chrome (Official Build) (64-bit)
- IndexedDB Version: Latest
- Leafstore-db Version: 1.1.0

## Documentation

- [API](#api)
  - [leafstore](#leafstore)
  - [leafstore.SchemaTypes](#leafstoreschematypes)
  - [leafstore.connect(options)](#leafstoreconnectoptions)
  - [db.Model(name, schema)](#dbmodelname-schema)
  - [leafstore.Schema(object)](#leafstoreschemaobject)
- [LeafstoreModel](#leafstoremodel)
  - [create(object)](#createobject)
  - [insertOne(object)](#insertoneobject)
  - [findByKey(key)](#findbykeykey)
  - [find(query)](#findquery)
  - [findOne(query)](#findonequery)
  - [findByKeyAndUpdate(key, update)](#findbykeyandupdatekey-update)
  - [updateOne(query, update)](#updateonequery-update)
  - [updateMany(query, update)](#updatemanyquery-update)
  - [findByKeyAndDelete(key)](#findbykeyanddeletekey)
  - [deleteOne(query)](#deleteonequery)
  - [deleteMany(query)](#deletemanyquery)
  - [deleteAll()](#deleteall)
  - [count(query)](#countquery)
  - [`query` methods](#query-methods)
- [LeafstoreSchema](#leafstoreschema)
  - [Validators](#validators)
  - [validate(object)](#validateobject)
  - [cast(object)](#castobject)
- [LeafstoreDocument](#leafstoredocument)
  - [save()](#save)
  - [toJSON()](#tojson)
  - [toString()](#tostring)

## API

### leafstore

#### leafstore(name)

- `name` - The name of the database

Creates a new database with the given name.

```javascript
const db = new leafstore("databaseName");
```

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

Connects to the database with the given options. If the database does not exist, it will create a new database with the given name. If the database already exists, it will connect to the database. If the version of the database is less than the given version, it will upgrade the database and call the `onUpgrade` callback function. If the version of the database is greater than the given version, it will throw an error.

```javascript
const db = new leafstore("databaseName");
await db.connect({
  version: 1,
  onUpgrade: (db) => {
    // Do something when the database is upgraded
  },
});
```

#### db.Model(name, schema)

- `name` - The name of the model
- `schema` - The schema of the model

Creates a new model with the given name and schema. If the model already exists, it will return the existing model. If the model does not exist, it will create a new model with the given name and schema. The **name** of the model should be unique.

```javascript
const User = db.Model("User", userSchema);
```

#### leafstore.Schema(object)

- `object` - The schema template of the model

Creates a new schema with the given schema. The schema template should be an object with the keys as the name of the fields and the values as the type of the fields. The type of the fields should be one of the `leafstore.SchemaTypes` or a schema object.

```javascript
const userSchema = leafstore.Schema({
  name: leafstore.SchemaTypes.String,
  age: leafstore.SchemaTypes.Number,
  email: leafstore.SchemaTypes.String,
  address: {
    city: leafstore.SchemaTypes.String,
    state: leafstore.SchemaTypes.String,
    country: leafstore.SchemaTypes.String,
  },
});
```

### LeafstoreModel

#### create(object)

- `object` - The object to be inserted

Inserts the given object into the collection. If the object already exists, it will throw an error.

```javascript
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
const user = await User.create(userObject);
```

#### insertOne(object)

- `object` - The object to be inserted

Inserts the given object into the collection. If the object already exists, it will update the object.

```javascript
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
const user = await User.insertOne(userObject);
```

#### findByKey(key)

- `key` - The key to be searched

Searches the collection for the given key and returns the result.

```javascript
const user = await User.findByKey("1703072469483950");
```

#### find(query)

- `query` - The query to be executed

Executes the given query and returns all the matching results.

```javascript
// Find all the users with the name John Doe
const users = await User.find({ name: "John Doe" });

// Find all the users with the age greater than 20
const users = await User.find({ age: { $gt: 20 } });

// Find all the users with the age greater than 20 and less than 30
const users = await User.find({ age: { $gt: 20, $lt: 30 } });

// Find all the users whose name starts with John
const users = await User.find({ name: { $regex: /^John/ } });
```

For more information on the `query` methods, see [query methods](#query-methods).

#### findOne(query)

- `query` - The query to be executed

Executes the given query and returns the first matching result.

```javascript
// Find any user with the name John Doe
const user = await User.findOne({ name: "John Doe" });

// Find any user with the age greater than 20
const user = await User.findOne({ age: { $gt: 20 } });
```

For more information on the `query` methods, see [query methods](#query-methods).

#### findByKeyAndUpdate(key, update)

- `key` - The unique key to be searched
- `update` - The update to be applied

Searches the collection for the given key and updates the document with the given update.

```javascript
// Update the user with the key 1703072469483950
const updatedUser = await User.findByKeyAndUpdate("1703072469483950", {
  age: 30,
});

console.log(updatedUser.age); // 30
```

#### updateOne(query, update)

- `query` - The query to be executed
- `update` - The update to be applied

Executes the given query and updates the first matching document with the given update.

```javascript
// Update any one user with the name John Doe
const updatedUser = await User.updateOne({ name: "John Doe" }, { age: 30 });

console.log(updatedUser.age); // 30
```

For more information on the `query` methods, see [query methods](#query-methods).

#### updateMany(query, update)

- `query` - The query to be executed
- `update` - The update to be applied

Executes the given query and updates all the matching documents with the given update.

```javascript
// Update all the users with the name John Doe
const updatedUsers = await User.updateMany({ name: "John Doe" }, { age: 30 });
```

For more information on the `query` methods, see [query methods](#query-methods).

#### findByKeyAndDelete(key)

- `key` - The unique key to be searched

Searches the collection for the given key and deletes the document. 

```javascript
// Delete the user with the key 1703072469483950
await User.findByKeyAndDelete("1703072469483950");
```

#### deleteOne(query)

- `query` - The query to be executed

Executes the given query and deletes the first matching document.

```javascript
// Delete any one user with the name John Doe
await User.deleteOne({ name: "John Doe" });
```

For more information on the `query` methods, see [query methods](#query-methods).

#### deleteMany(query)

- `query` - The query to be executed

Executes the given query and deletes all the matching documents.

```javascript
// Delete all the users with the name John Doe
await User.deleteMany({ name: "John Doe" });
```

For more information on the `query` methods, see [query methods](#query-methods).

#### deleteAll()

Deletes all the documents in the collection. `Be careful` while using this method.

```javascript
// Delete all the users
await User.deleteAll();
// a less efficient way
await User.deleteMany();
```

#### count(query)

- `query` - The query to be executed

Executes the given query and returns the count of the documents matching the query.

```javascript
// Count all the users with the name John Doe
const count = await User.count({ name: "John Doe" });
```

For more information on the `query` methods, see [query methods](#query-methods).

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

```javascript
// query for finding all the users with the name John Doe
const q = { name: "John Doe" };

// query for finding all the users with the age greater than 20
const q = { age: { $gt: 20 } };

// query for finding all the users with the age greater than 20 and less than 30
const q = { age: { $gt: 20, $lt: 30 } };

// query for finding all the users whose name starts with John
const q = { name: { $regex: /^John/ } };
```

### LeafstoreSchema

#### Validators

- `required` - Checks if the value is present
- `minValue` - Checks if the value is greater than or equal to the given value
- `maxValue` - Checks if the value is less than or equal to the given value
- `minLength` - Checks if the length of the value is greater than or equal to the given value
- `maxLength` - Checks if the length of the value is less than or equal to the given value

```javascript
const userSchema = leafstore.Schema({
  name: {
    type: leafstore.SchemaTypes.String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  age: {
    type: leafstore.SchemaTypes.Number,
    required: true,
    minValue: 18,
    maxValue: 100,
  },
  email: {
    type: leafstore.SchemaTypes.String,
    required: true,
  },
  address: {
    city: {
      type: leafstore.SchemaTypes.String,
      required: true,
    },
    state: {
      type: leafstore.SchemaTypes.String,
      required: true,
    },
    country: {
      type: leafstore.SchemaTypes.String,
      required: true,
    },
  },
});
```

#### validate(object)

- `object` - The object to be validated (internal use)

Validates the given object against the schema.

#### cast(object)

- `object` - The object to be casted. (internal use)

Casts the given object against the schema.

### LeafstoreDocument

#### save()

Saves the document to the collection. If the document already exists, it will update the document.

```javascript
const user = await User.findOne({ name: "John Doe" });

user.age = 30;

await user.save();

console.log(user.age); // 30
```

#### toJSON()

Returns the JSON representation of the document.

#### toString()

Returns the string representation of the document.

## License

[MIT &copy; Ujjwal Jindal - 2023](https://choosealicense.com/licenses/mit/)
