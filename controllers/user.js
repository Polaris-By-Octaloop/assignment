const jwt = require("jsonwebtoken");
const User = require("../models/user");


const signin = async (req, res) => {
	const { email, password } = req.body;

	try {
		let cookieEmail;
		let cookieRole;
		const user = await User.findOne({ email: email });

		if (user === null) {
			return res.status(404).send({
				msg: "This email is not Registered",
			});
		}

		console.log(user)

		if (user.password === password) {
			if (user.status !== "Active") {
				return res.status(400).send({
					message: "Pending Account. Please Verify Your Email!",
				});
			}
			cookieEmail = user.email;
			cookieRole = "user";
		} else {
			return res.status(400).send({
				msg: "Invalid Credentials",
			});
		}


		const accessToken = jwt.sign(
			{ data: { email: cookieEmail, role: cookieRole } },
			process.env.VERIFY_AUTH_TOKEN,
			{
				expiresIn: "30s",
			}
		);
		const refreshToken = jwt.sign(
			{ data: { email: cookieEmail, role: cookieRole } },
			process.env.VERIFY_REFRESH_TOKEN,
			{
				expiresIn: "3h",
			}
		);

		res
			.status(202)
			.cookie("accessToken", accessToken, {
				expires: new Date(new Date().getTime() + 30 * 1000),
				httpOnly: true,
				sameSite: "strict",
				domain: process.env.DOMAIN
			})
			.cookie("authSession", true, {
				expires: new Date(new Date().getTime() + 30 * 1000),
				domain: process.env.DOMAIN
			})
			.cookie("refreshToken", refreshToken, {
				expires: new Date(new Date().getTime() + 3557600000),
				httpOnly: true,
				sameSite: "strict",
				domain: process.env.DOMAIN
			})
			.cookie("refreshTokenID", true, {
				expires: new Date(new Date().getTime() + 3557600000),
				domain: process.env.DOMAIN
			})
			.send({
				msg: "Logged in successfully",
				email: cookieEmail,
				role: cookieRole,
			});

	} catch (err) {
		res.send({ msg: err });
	}
};

// Refresh Route
const refresh = (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) {
		return res.status(403).send({
			msg: "Refresh Token Not Found, Please Login Again",
		});
	}
	try {
		const payload = jwt.verify(refreshToken, process.env.VERIFY_REFRESH_TOKEN);
		const accessToken = jwt.sign(
			{ data: { email: payload.data.email, role: payload.data.role } },
			process.env.VERIFY_AUTH_TOKEN,
			{
				expiresIn: "30s",
			}
		);
		res
			.status(202)
			.cookie("accessToken", accessToken, {
				expires: new Date(new Date().getTime() + 30 * 1000),
				sameSite: "strict",
				httpOnly: true,
				domain: process.env.DOMAIN
			})
			.cookie("authSession", true, {
				expires: new Date(new Date().getTime() + 30 * 1000),
				domain: process.env.DOMAIN
			})
			.send({ email: payload.data.email, role: payload.data.role });
	} catch (err) {
		res.status(403).send({ msg: err, success: false });
	}
};

// Get user Profile
const getUserProfile = async (req, res) => {

	const user = req.user
	try {
		res.send({ data: user });
	} catch (err) {
		console.log(err)
		res.status(403).send({ msg: err });
	}
};

// Update Profile
const updateProfile = async (req, res) => {
	const {
		name,
		email,
		address,
		city,
		state,
		zipCode,
		country
	} = req.body;

	try {
		const user = req.user
		const result = await User.findOneAndUpdate(
			{ email: user.email },
			{
				$set: {
					name,
					address: address,
					city: city,
					state: state,
					zipCode: zipCode,
					country: country,
				},
			}
		);
		return res.status(200).send({ result });
	} catch (err) {
		res.status(400).send(err);
	}
};

// Logout User
const logout = async (req, res) => {
	try {
		res
			.cookie("refreshToken", "none", {
				expires: new Date(Date.now() + 5 * 1000),
				httpOnly: true,
				domain: process.env.DOMAIN
			})
			.cookie("accessToken", "none", {
				expires: new Date(Date.now() + 5 * 1000),
				httpOnly: true,
				domain: process.env.DOMAIN
			})
			.cookie("authSession", "none", {
				expires: new Date(Date.now() + 5 * 1000),
				httpOnly: true,
				domain: process.env.DOMAIN
			})
			.cookie("refreshTokenID", "none", {
				expires: new Date(Date.now() + 5 * 1000),
				httpOnly: true,
				domain: process.env.DOMAIN
			})
			.send("User Logged Out");
	} catch (e) {
		console.log(e);
		return res.status(400).send(e);
	}
};

module.exports = {
	signin,
	updateProfile,
	getUserProfile,
	logout,
	refresh
};
