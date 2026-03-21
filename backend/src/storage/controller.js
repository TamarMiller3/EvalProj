const { getCollection } = require('./db');

const COLLECTION = 'evaluations';

async function createEvaluation(data) {
    const col = await getCollection(COLLECTION);

    const exists = await col.findOne({ userCode: data.userCode });
    if (exists) throw new Error('קוד זה כבר תפוס');

    const doc = {
        ...data,
        createdAt: new Date(),
        savedAt: new Date()
    };

    await col.insertOne(doc);
    return doc;
}

async function getEvaluation(code) {
    const col = await getCollection(COLLECTION);
    return col.findOne({ userCode: code });
}

async function updateEvaluation(code, data) {
    const col = await getCollection(COLLECTION);

    await col.updateOne(
        { userCode: code },
        { $set: { ...data, savedAt: new Date() } }
    );

    return getEvaluation(code);
}

async function listAll() {
    const col = await getCollection(COLLECTION);
    return col.find().sort({ savedAt: -1 }).toArray();
}

async function deleteEvaluation(code) {
    const col = await getCollection(COLLECTION);
    return col.deleteOne({ userCode: code });
}

module.exports = {
    createEvaluation,
    getEvaluation,
    updateEvaluation,
    listAll,
    deleteEvaluation
};