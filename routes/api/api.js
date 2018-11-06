const router = require('express').Router();
const axios = require('axios');
const DBPASS = process.env.DBPASS;
const db = require('../../models');

router.post("/builddb", (req, res) => {
    const cardList = [];
    const cardListBuilder = (setList, i) => {
        if (i < setList.length) {
            axios
                .get("http://yugiohprices.com/api/set_data/" + encodeURIComponent(setList[i]))
                .then((resp) => {
                    console.log("getting set data for " + setList[i]);
                    resp.data.data.cards.forEach((elem) => {
                            cardList.push(elem.name);
                        });
                    cardListBuilder(setList, ++i);
                })
                .catch((err) => {
                    console.log(err, "error getting set data for set " + setList[i]);
                    res.status(500).json({ err: err, msg: "error getting set data for " + setList[i] });
                }) 
        } else {
            console.log("filtering and returning cardlist");
            const reducedList = cardList.filter((elem, pos) => cardList.indexOf(elem) == pos).sort().map((elem) => { return {cardName: elem} });
            db.CardList
                .insertMany(reducedList)
                .then(dbModel => {
                    console.log("success writing to DB");
                    res.status(200).json({resp: dbModel, msg: "Success!"});
                })
                .catch(err => {
                    console.log(JSON.stringify(err));
                    console.log("Error writing to DB");
                    res.status(422).json({err: err, msg: "Failed to write to database."})
                });
        }
    }
    
    if (req.query.apikey !== DBPASS) {
        res.status(403).json({
            error: "You do not have permission to access this resource."
        });
    } else {
        axios
            .get("http://yugiohprices.com/api/card_sets")
            .then((resp) => {
                cardListBuilder(resp.data, 0);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    error: err,
                    msg: "Failed to retrieve set list"
                });
            });
    }
});
module.exports = router;