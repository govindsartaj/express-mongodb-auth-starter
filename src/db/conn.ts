import * as mongoDB from 'mongodb';
const connectionString = process.env.ATLAS_URI;
const client = new mongoDB.MongoClient(connectionString);

let dbConnection: mongoDB.Db;

export function connect(callback: Function) {
  client.connect(function (err, db) {
    if (err || !db) {
      return callback(err);
    }
    dbConnection = db.db('auth');
    console.log('Successfully connected to MongoDB.');

    return callback();
  });
}

export function getDb() {
  return dbConnection;
}
