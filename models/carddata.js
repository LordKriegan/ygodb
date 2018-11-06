const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardDataSchema = new Schema({
    cid: {type: String, required: true},
    data: {cardData: {}, required: true}
});

const CardData = mongoose.model("CardData", CardDataSchema);

module.exports = CardData;