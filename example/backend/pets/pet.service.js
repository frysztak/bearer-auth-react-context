const faker = require('faker');

function getPet() {
    return {
        id: faker.datatype.uuid(),
        name: faker.random.word(),
    }
}

module.exports = {
    getPet,
}
