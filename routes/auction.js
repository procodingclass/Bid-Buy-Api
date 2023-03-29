const express = require("express");
const db = require("../config");

const { FieldValue, Firestore } = require('firebase-admin/firestore');
const { body, validationResult } = require("express-validator");
const router = express.Router();
const IP = require('ip');

/*
    Get all Auction items endpoint: http://host/api/auction/getOpenAuction
    method: GET
*/	

router.get("/getAllOpenAuction/:appId", async (req, res) => {
	try {
		const { appId} = req.params;
        var currentdate = new Date(); 
		
		const ip = IP.address();
		console.log(ip)

		const auctionsRef = db.collection("auctions");
		const snapshot = await auctionsRef
        .where("appId", "==", appId)
        .where("status", "==", "open")
		.get();

		if (snapshot.empty) {
			return res.status(400).json({ auctions: [], errorMessage: "No Auctions found" });
		}
        
		let auctionsData = [];
		snapshot.forEach((doc) => {

             if(new Date(doc.data().time.seconds*1000) > currentdate){
                data={
					appId : doc.data().appId,
					auctionId: doc.data().auctionId,
					bidders : doc.data().bidders,
					description : doc.data().description,
					highestBid : doc.data().highestBid,
					image : doc.data().image,
					itemName : doc.data().itemName,
					startBid : doc.data().startBid,
					status : doc.data().status,
					time : new Date(doc.data().time.seconds*1000).getDate() - currentdate.getDate(),
					userId : doc.data().userId,
				     }

                auctionsData.push(data);

             }
             else{
                db.collection('auctions').doc(doc.id).update({"status":"closed"})
             }
		});
		return res.status(200).json({ auctions: auctionsData });
	} catch (error) {
		console.log(error.message);
		res.status(502).send({ "errorMessage ": "Pass valid values" });
	}
});



/*
    Get user auctions (buying) endpoint: http://host/api/auction/bids/:appId/:userid
    method: GET

*/

router.get("/bids/:appId/:userId", async (req, res) => {
	try {
		const { appId, userId} = req.params;
        var currentdate = new Date();

		const auctionsRef = db.collection("auctions");
		const snapshot = await auctionsRef
			.where("appId", "==", appId)
            .where("bidders","array-contains", userId)
            .where("status","==","open")
			.get();

		if (snapshot.empty) {
			return res.status(400).json({ auctions: [], errorMessage: "You have not placed bids" });
		}

		let auctionsData = [];
		snapshot.forEach((doc) => {

			if(new Date(doc.data().time.seconds*1000) > currentdate){
                auctionsData.push(doc.data());
             }
             else{
                db.collection('auctions').doc(doc.id).update({"status":"closed"})
             }
			 
		});
		return res.status(200).json({ auctions: auctionsData });
	} catch (error) {
		console.log(error.message);
		res.status(502).send({ "errorMessage ": "Pass valid values" });
	}
});



/*
    Get user auctions (purchased) endpoint: http://host/api/auctions/purchased/:appId/:userId
    method: GET

*/

router.get("/purchased/:appId/:userId", async (req, res) => {
	try {
		const { appId, userId} = req.params;
        var currentdate = new Date();

		const auctionsRef = db.collection("auctions");
		const snapshot = await auctionsRef
			.where("appId", "==", appId)
            .where("highestBid","array-contains", userId)
            .where("status","==","close")
			.get();

		if (snapshot.empty) {
			return res.status(400).json({ auctions: [], errorMessage: "No auctions found" });
		}

		let auctionsData = [];
		snapshot.forEach((doc) => {
			if(new Date(doc.data().time.seconds*1000) > currentdate){
                auctionsData.push(doc.data());
             }
             else{
                db.collection('auctions').doc(doc.id).update({"status":"closed"})
             }
		});
		return res.status(200).json({ auctions: auctionsData });
	} catch (error) {
		console.log(error.message);
		res.status(502).send({ "errorMessage ": "Pass valid values" });
	}
});

/*
    Get user auctions (Sold) endpoint: http://host/api/auctions/sold/:appId/:userId
    method: GET

*/

router.get("/sold/:appId/:userId", async (req, res) => {
	try {
		const { appId, userId} = req.params;
        var currentdate = new Date();
		const auctionsRef = db.collection("auctions");
		const snapshot = await auctionsRef
			.where("appId", "==", appId)
            .where("userId","==", userId)
            .where("status","==","close")
			.get();

		if (snapshot.empty) {
			return res.status(400).json({ auctions: [], errorMessage: "No auctions found" });
		}

		let auctionsData = [];
		snapshot.forEach((doc) => {
			if(new Date(doc.data().time.seconds*1000) > currentdate){
                auctionsData.push(doc.data());
             }
             else{
                db.collection('auctions').doc(doc.id).update({"status":"closed"})
             }
		});
		return res.status(200).json({ auctions: auctionsData });
	} catch (error) {
		console.log(error.message);
		res.status(502).send({ "errorMessage ": "Pass valid values" });
	}
});



/*
    Get auctions put on sale by the user (On Sale by a user) endpoint: http://host/api/auctions/onSale/:appId/:userId
    method: GET
*/	

router.get("/onSale/:appId/:userId", async (req, res) => {
	try {
		const { appId, userId} = req.params;

        var currentdate = new Date();
		const auctionsRef = db.collection("auctions");
		const snapshot = await auctionsRef
			.where("appId", "==", appId)
            .where("userId","==", userId)
            .where("status","==","open")
			.get();

		if (snapshot.empty) {
			return res.status(400).json({auctions: [], errorMessage: "No auctions found" });
		}

		let auctionsData = [];
		snapshot.forEach((doc) => {
			if(new Date(doc.data().time.seconds*1000) > currentdate){
                auctionsData.push(doc.data());
             }
             else{
                db.collection('auctions').doc(doc.id).update({"status":"closed"})
             }
		});
		return res.status(200).json({ auctions: auctionsData });
	} catch (error) {
		console.log(error.message);
		res.status(502).send({ "errorMessage ": "Pass valid values" });
	}
});

/*
    Add new auction item endpoint: http://host/api/auction/add
    method: POST
*/

router.post("/add",
    body('appId', "Invalid app Id").isLength({ min: 2 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const myError = errors["errors"][0]["msg"]
            return res.status(400).json({ "error_message ": myError });
        }

        try {
            const { appId, itemName, image, userId, startBid, days, description} = req.body;
			

			var date = new Date();
			date.setDate(date.getDate() + Number(days));
            const auction = await db.collection("auctions").doc();
	
            auction.set({
                appId: appId,
                auctionId: auction.id,
                itemName: itemName,
				description: description,
                image: image,
                bidders: [],
                userId: userId? userId : "appId",
                time: date,
                startBid: startBid,
                status: "open",
                highestBid : [startBid,"no User"]
            });

            res.status(200).send({ "success_code ": "auction added successfully" })
        }
        catch (error) {
            console.log(error.message)
            res.status(500).send({ "error_message ": "Pass valid values" })
        }
    })

/*
  Increase bid endpoint: http://host/api/auction/increaseBid/:appId/:userId/:feedId
    method: GET

*/
router.get("/increaseBid/:appId/:auctionId/:userId/:userName", async (req, res) => {
	try {
		const { appId, auctionId, userId, userName} = req.params;
		console.log(appId, auctionId, userId)
		var currentdate = new Date();
		const auctionRef = db.collection("auctions");
		const snapshot = await auctionRef
			.where("appId", "==", appId)
            .where("auctionId", "==", auctionId)
			.get();

		if (snapshot.empty) {
			console.log("no auction found")
			return res.status(400).json({ auction: [], errorMessage: "No auction found" });
		}

		let auctionData = [];
		flag = 1
		snapshot.forEach((doc) => {
			
			if(new Date(doc.data().time.seconds*1000) > currentdate){
                data={
					appId : doc.data().appId,
					auctionId: doc.data().auctionId,
					bidders : doc.data().bidders,
					description : doc.data().description,
					highestBid : doc.data().highestBid,
					image : doc.data().image,
					itemName : doc.data().itemName,
					startBid : doc.data().startBid,
					status : doc.data().status,
					time : new Date(doc.data().time.seconds*1000).getDate() - currentdate.getDate(),
					userId : doc.data().userId,
				     }

                auctionData = data;
             }
             else{
                db.collection('auctions').doc(doc.id).update({"status":"closed"})
				flag=0
             }
			
		});

		if(flag ==0){
			return res.status(400).json({ auction: [], errorMessage: "Auction is closed" });
		}

        if(auctionData.userId == userId){
			return res.status(400).json({ auction: [], errorMessage: "Seller can not increase the bid" });
        }
        if(auctionData.highestBid[1] == userId){
			return res.status(400).json({ auction: [], errorMessage: "Highest bidder can not increase the bid" });
        }

        
        auction = auctionRef.doc(auctionId)

        newBid = Math.floor(Number(auctionData.highestBid[0]) + Number(auctionData.highestBid[0]) * 0.05)
        
        // add bidder to bidders
        allBidders = auctionData.bidders

        flag = 0
        for(i in allBidders){
            if(allBidders[i] == userId){
                flag = 1
            }
        }
         
        if(flag ==0){
            allBidders.push(userId)
        }
        
        // set highest bid
        auction.update(
            {"highestBid": [newBid, userId, userName],
              "bidders" : allBidders
           })
 
		auctionData.highestBid = [newBid, userId]
	    auctionData.bidders = allBidders

		return res.status(200).json(auctionData);
	} catch (error) {
		console.log(error)
		res.status(502).send({ "errorMessage ": "Pass valid values" });
	}
});


/*
  Increase bid endpoint: http://host/api/auction/increaseBid/:appId/:userId/:feedId
    method: GET

*/
router.get("/increaseBid/:appId/:auctionId/:userId", async (req, res) => {
	try {
		const { appId, auctionId, userId} = req.params;
		console.log(appId, auctionId, userId)
		var currentdate = new Date();
		const auctionRef = db.collection("auctions");
		const snapshot = await auctionRef
			.where("appId", "==", appId)
            .where("auctionId", "==", auctionId)
			.get();

		if (snapshot.empty) {
			console.log("no auction found")
			return res.status(400).json({ auction: [], errorMessage: "No auction found" });
		}

		let auctionData = [];
		flag = 1
		snapshot.forEach((doc) => {
			
			if(new Date(doc.data().time.seconds*1000) > currentdate){
                data={
					appId : doc.data().appId,
					auctionId: doc.data().auctionId,
					bidders : doc.data().bidders,
					description : doc.data().description,
					highestBid : doc.data().highestBid,
					image : doc.data().image,
					itemName : doc.data().itemName,
					startBid : doc.data().startBid,
					status : doc.data().status,
					time : new Date(doc.data().time.seconds*1000).getDate() - currentdate.getDate(),
					userId : doc.data().userId,
				     }

                auctionData = data;
             }
             else{
                db.collection('auctions').doc(doc.id).update({"status":"closed"})
				flag=0
             }
			
		});

		if(flag ==0){
			return res.status(400).json({ auction: [], errorMessage: "Auction is closed" });
		}

        if(auctionData.userId == userId){
			return res.status(400).json({ auction: [], errorMessage: "Seller can not increase the bid" });
        }
        if(auctionData.highestBid[1] == userId){
			return res.status(400).json({ auction: [], errorMessage: "Highest bidder can not increase the bid" });
        }

        
        auction = auctionRef.doc(auctionId)

        newBid = Math.floor(Number(auctionData.highestBid[0]) + Number(auctionData.highestBid[0]) * 0.05)
        
        // add bidder to bidders
        allBidders = auctionData.bidders

        flag = 0
        for(i in allBidders){
            if(allBidders[i] == userId){
                flag = 1
            }
        }
         
        if(flag ==0){
            allBidders.push(userId)
        }
        
        // set highest bid
        auction.update(
            {"highestBid": [newBid, userId],
              "bidders" : allBidders
           })
 
		auctionData.highestBid = [newBid, userId, 'app']
	    auctionData.bidders = allBidders

		return res.status(200).json(auctionData);
	} catch (error) {
		console.log(error)
		res.status(502).send({ "errorMessage ": "Pass valid values" });
	}
});


module.exports = router;
