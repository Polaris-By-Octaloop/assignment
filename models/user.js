var mongoose = require("mongoose");


const stringValue = {
	type: String,
	trim: true,
};

// Status Model
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true,
	},
	email: {
		type: String,
		trim: true,
		required: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("not an email");
			}
		},
	},
	password: {
		type: String,
		trim: true,
		required: true,
	},

	address: stringValue,
	city: stringValue,
	state: stringValue,
	country: stringValue,
	zipCode: stringValue,
	status: {
		type: String,
		enum: ['Pending', 'Active', 'Suspended'],
		default: 'Pending'
	}

});

mongoose.pluralize(null);
const User = mongoose.model("User", userSchema);

module.exports = User;
