const express = require("express");
const db = require("../config");

const { body, validationResult } = require("express-validator");
const router = express.Router();

/*
    GTG
    Add Feed API endpoint: http://host/api/user/signUp
    method: POST
    {username, email, password} : required
*/
router.post(
	"/signUp",
    body("appId", "Invalid app Id").isLength({ min: 2 }),
	body("name", "Invalid Name").isLength({ min: 3 }),
	body("username", "Invalid Username").isLength({ min: 3 }),
	body("password", "Password should be at least 5 characters long").isLength({
		min: 5,
	}),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const myError = errors["errors"][0]["msg"];
			return res.status(400).json({ errorMessage: myError });
		}

		try {
			const { appId, username, name, password, email } = req.body;
			const usersRef = db.collection("users");
			const snapshot = await usersRef
				.where("username", "==", username)
				.where("appId", "==", appId)
				.get();

			if (snapshot.empty) {
				const createUser = await db.collection("users").doc();
				createUser.set({
					userId: createUser.id,
					appId: appId,
					username: username,
					name: name,
					email: email,
					password: password,
					profileImage:
						"https://procodingclass.github.io/tynker-vr-gamers-assets/assets/defaultProfileImage.png"
				});

				const newSnapshot = await usersRef
					.where("username", "==", username)
					.where("appId", "==", appId)
					.get();

				let userDetails = {};
				newSnapshot.forEach((doc) => {
					userDetails = doc.data();
				});
				return res.status(200).json({ user: userDetails });
			}
			return res.status(400).json({ errorMessage: "Username already exist" });
		} catch (error) {
			// console.log(error.message)
			res.status(500).send({ errorMessage: "Pass valid values" });
		}
	}
);

/*  GTG
    Add Feed API endpoint: http://host/api/user/signIn
    method: POST
    {email, password} : required
*/
router.post(
	"/signIn",
    body("appId", "Invalid app Id").isLength({ min: 2 }),
	body("username", "Invalid Username").isLength({ min: 3 }),
	body("password", "Invalid password").isLength({ min: 5 }),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const myError = errors["errors"][0]["msg"];
			return res.status(400).json({ errorMessage: myError });
		}

		try {
			const { appId, username, password } = req.body;

			const usersRef = db.collection("users");
			const snapshot = await usersRef
				.where("username", "==", username)
				.where("appId", "==", appId)
				.where("password", "==", password)
				.get();

			if (snapshot.empty) {
				return res
					.status(400)
					.json({ user: {}, errorMessage: "Incorrect credentials" });
			}
			let userDetails = {};
			snapshot.forEach((doc) => {
				userDetails = doc.data();
			});
			console.log("loggedIn");
			return res.status(200).json({ user: userDetails });
		} catch (error) {
			res.status(500).send({ errorMessage: "Pass valid values" });
		}
	}
);

/*
    Get user profile endpoint: http://host/api/user/getProfile
    method: GET
*/

router.get("/getProfile/:userId/:appId", async (req, res) => {
	try {
		const { appId, userId } = req.params;

		const userRef = db.collection("users");
		const snapshot = await userRef
			.where("appId", "==", appId)
			.where("userId", "==", userId)
			.get();
		if (snapshot.empty) {
			return res.status(400).json({ user: [], errorMessage: "No user found" });
		}
		let userData = [];
		snapshot.forEach((doc) => {
			userData.push(doc.data());
		});
		return res.status(200).json({ user: userData });
	} catch (error) {
		console.log(error.message);
		res.status(502).send({ "errorMessage ": "Pass valid values" });
	}
});

/*
    Update user profile endpoint: http://host/api/user/updateProfile
    method: POST
*/
router.post(
	"/updateProfile",
	body("appId", "Invalid app Id").isLength({ min: 2 }),
	body("name", "Invalid Full Name").isLength({ min: 2 }),
	body("userId", "Invalid User Id").isLength({ min: 2 }),
	body("profileImage", "Invalid profile image").isLength({ min: 2 }),
    async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const myError = errors["errors"][0]["msg"];
			return res.status(400).json({ errorMessage: myError });
		}
		try {
			const { appId, userId, name, profileImage } = req.body;
			const usersRef = db.collection("users");
			const snapshot = await usersRef
				.where("userId", "==", userId)
				.where("appId", "==", appId)
				.get();

			if (snapshot.empty) {
				return res
					.status(200)
					.json({ user: {}, successMessage: "No user found" });
			}

			usersRef.doc(userId).update({
				name: name,
				profileImage: profileImage
			});
			res.status(200).send({ successMessage: "Profile updated successfully" });
		} catch (error) {
			console.log(error.message);
			res.status(500).send({ errorMessage: "Pass valid values" });
		}
	}
);

module.exports = router;