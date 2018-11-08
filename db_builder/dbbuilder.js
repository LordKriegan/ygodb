const axios = require('axios');
const fs = require('fs');
fs.appendFileSync("dbbuildlog.txt", "=================================" + Date() + "==============================\n");
const cardList = [];
const log = (obj) => {
    const str = JSON.stringify(obj);
    console.log(str);
    try {
        fs.appendFileSync("dbbuildlog.txt", str + "\n");
        
      } catch (err) {
        fs.appendFileSync("dbbuildlog.txt", JSON.stringify(err) + "\n");
      }
}
const cardListBuilder = (setList, i) => {
    if (i < setList.length) {
        axios
            .get("http://yugiohprices.com/api/set_data/" + encodeURIComponent(setList[i]))
            .then((resp) => {
                log("getting set data for " + setList[i] + ". " + (i + 1) + "/" + setList.length);
                resp.data.data.cards.forEach((elem) => {
                    if (cardList.indexOf(elem.name) === -1) cardList.push(elem.name);
                });
                setTimeout(() => cardListBuilder(setList, ++i), 1000);
            })
            .catch((err) => {
                log("error getting set data for set " + setList[i] + "\n" + JSON.stringify(err.response) + "\n");
                setTimeout(() => cardListBuilder(setList, i), 1000);
            })
    } else {
        log("starting calls to create db");
        fs.writeFile('dbcardlist.json', JSON.stringify(cardList.sort()), 'utf8');
        setTimeout(() => cardDataBuilder(cardList, 0), 1000);
    }
}

const cardDataBase = [];
const cardDataBuilder = (cardList, i) => {
    if (i < cardList.length) {
        axios
            .get("http://yugiohprices.com/api/card_data/" + encodeURIComponent(cardList[i]))
            .then((resp) => {
                log("getting card data for " + cardList[i] + ". " + "Card number " + (i + 1) + "/" + cardList.length);
                cardDataBase.push({ cardName: cardList[i], cardData: resp.data.data });
                setTimeout(() => cardDataBuilder(cardList, ++i), 1000);
            }).catch((err) => {
                log("error getting data for card " + cardList[i]);
                cardDataBase.push({ cardName: cardList[i], cardData: "Missing Data!" });
                setTimeout(() => cardDataBuilder(cardList, ++i), 1000);
            });
    } else {
        console.log("saving cardDataBase var to json file");
        
        //write to dbbuilder.json
        fs.writeFile('dbbuilder.json', JSON.stringify(cardDataBase), 'utf8');
        fs.appendFileSync('dbbuildlog.txt', "================================END OF ATTEMPT=========================\n");
    }

}

axios
.get("http://yugiohprices.com/api/card_sets")
.then((resp) => {
    setTimeout(() => cardListBuilder(resp.data, 0), 1000);
}).catch((err) => {
    log("error retrieving set list");
    log(err.response);
});


/*
use this when you are ready to import to remote db
            mongoimport -h  xxx.mlab.com --port 2700  -d db_name -c collection_name -u user_name -p password  --type json --file  /Path/to/file.json
            may have to specify jsonArray somehow :p
and this for local db
            mongoimport -d ygodb -c cardList --file filename --jsonArray
*/