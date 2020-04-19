const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: ['true', 'Every Doctor must have a name']
	},
	gender: {
		type: String,
		// required: ['true', 'Every Doctor must have a gender'];
	},
	achievements: [String],
	experience: Number,
	location: String,
	display_picture: String,
	description: String,
	email: { 
		type: String,
		unique: true 
	},
	password: {
		type: String,
		required: [true, 'Every user must have a password.']
	},
	mobile: { 
		type: Number,
		unique: true
	},
	specializations: { type: [String] },
	qualifications: { type: [String] },
	awards: { type: [String] },
	avg_fees: { type: Number },
	hospitalList: { type: [mongoose.Schema.ObjectId] },
	startTime: { type: Date, required: true },
	endTime: { type: Number, required: true },
	slotDuration: { type: Number, enum: [15,30,45,60] }
});

doctorSchema.pre('save', async function(next){
	const passwordValidator = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
	if(this.isModified('password')){
		if(passwordValidator.test(this.password)) next();
		else {
			const err = new Error('Password must contain One Uppercase, One lowercase and One number character');
			next(err);
		}
	}
})

doctorSchema.pre('save', async function(next) {
	if(this.isModified('password')){
		this.password = await bcrypt.hash(this.password, 12);
		next();	
	}
});

doctorSchema.methods.comparePassword = async function(hashedPassword, enteredPassword) {
	return await bcrypt.compare(hashedPassword, enteredPassword);
}



const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;