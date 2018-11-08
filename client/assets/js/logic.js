const cardList = [];
const cardListBuilder = (setList, i) => {
    if (i < setList.length) {
        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/http://yugiohprices.com/api/set_data/" + encodeURIComponent(setList[i]),
            method: "GET"
        })
            .then((resp) => {
                console.log("getting set data for " + setList[i]);
                resp.data.cards.forEach((elem) => {
                    if (!(cardList.indexOf(elem.name))) cardList.push(elem.name);
                });
                setTimeout(() => cardListBuilder(setList, ++i), 1000);
            })
            .catch((err) => {
                console.log(err, "error getting set data for set " + setList[i]);
            })
    } else {
        console.log("starting calls to create db");
        setTimeout(() => cardDataBuilder(cardList.sort(), 0));
    }
}

const cardDataBase = [];
const cardDataBuilder = (cardList, i) => {
    if (i < cardList.length) {
        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/http://yugiohprices.com/api/card_data/" + encodeURIComponent(cardList[i]),
            method: "GET"
        }).then((resp) => {
            console.log("getting card data for " + cardList[i]);
            console.log("Card number " + (i + 1) + "/" + cardList.length)
            cardDataBase.push({ cardName: cardList[i], cardData: resp.data });
            setTimeout(() => cardDataBuilder(setList, ++i), 1000);
        }).catch((err) => {
            console.log("error getting data for card " + cardList[i])
            console.log(err);
        });
    } else {
        console.log("saving cardDataBase var to mongodb")
        $.ajax({
            url: "/api/builddb",
            method: "POST",
            data: cardDataBase
        }).then((resp) => {
            console.log(resp);
        }).catch((err) => {
            console.log(err);
        });
    }

}

$("#startBuild").on("click", (e) => {
    e.preventDefault();
    console.log("Commencing database build");
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/http://yugiohprices.com/api/card_sets",
        method: "GET"
    }).then((resp) => {
        console.log(resp);
        setTimeout(() => cardListBuilder(resp, 0), 1000);
    }).catch((err) => {
        console.log("error retrieving set list");
        console.log(err);
    });
})