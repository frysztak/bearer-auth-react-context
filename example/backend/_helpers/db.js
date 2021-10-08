const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function connect() {
    const mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    const mongooseOpts = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    };

    return await mongoose.connect(uri, mongooseOpts);
}

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
    User: require('users/user.model'),
    RefreshToken: require('users/refresh-token.model'),
    isValidId,
    connect
};
