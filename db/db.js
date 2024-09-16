const mongoose = require('mongoose');

let instance = null;

class Database {
  constructor() {
    if (!instance) {
        this.mongoConnection = null;
        instance = this;
    }
    return instance
  }

  async connect(options){
    try {
        console.log("DB Connecting...");
        const database = await mongoose.connect(options.MONGODB_CONNECTION_STRING)
        this.mongoConnection = database;
        console.log("DB Connected!");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
  }
}

module.exports = new Database();