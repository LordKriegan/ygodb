const router = require('express').Router();
const axios = require('axios');
const DBPASS = process.env.DBPASS;
const db = require('../../models');

router.post("/builddb", (req, res) => {
    if (req.query.apikey !== DBPASS) {
        res.status(403).json({
            error: "You do not have permission to access this resource."
        });
    } else {
        console.log("Commencing database build");
        console.log(req.body.card);
        db.CardList
        .create(req.body.card)
        .then(dbModel => {
            console.log("success writing to DB");
            res.status(200).json({ resp: dbModel, msg: "Success!" });
        })
        .catch(err => {
            console.log(JSON.stringify(err));
            console.log("Error writing to DB");
            res.status(422).json({ err: err, msg: "Failed to write to database." })
        });
    }
});
module.exports = router;