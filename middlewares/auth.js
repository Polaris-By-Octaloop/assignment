const jwt = require("jsonwebtoken");
const User = require("../models/user")

const auth = async (req, res, next) => {
	const token = req.cookies.accessToken;

	if (!token) {
		return res.status(400).send({ error: "Access denied" });
	} else {
		try {
			const payload = await jwt.verify(token, process.env.VERIFY_AUTH_TOKEN);
			req.user = await User.findOne({ email: payload.data.email })
			next();
		} catch (e) {
			console.log(e.message)
			if (e.name === "TokenExpiredError") {
				return res.status(400).send({ e: "Session timed out" });
			} else if (e.name === "JsonWebTokenError") {
				return res.status(400).send({ e: "Invalid token" });
			} else {
				return res.status(400).send({ e: "Unknown error" });
			}
		}
	}
};

module.exports = { auth };
