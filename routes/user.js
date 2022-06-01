const express = require("express");
const { auth } = require("../middlewares/auth");
const router = express.Router();
const {
	signin,
	getUserProfile,
	updateProfile,
	refresh,
	logout
} = require("../controllers/user");


router.post("/signin", signin);

router.post("/refresh", refresh);

router.get("/user", auth, getUserProfile);

router.post("/updateProfile", auth, updateProfile);

router.post("/logout", auth, logout);

module.exports = {
	route: router,
};
