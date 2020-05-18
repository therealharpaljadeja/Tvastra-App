const Doctor = require('./../models/doctorModel').Doctor;
const Hospital = require('./../models/hospitalModel');
const multer = require('multer');
const path = require('path');
const User = require('./../models/userModel');
// const getAllDoctors = async (req, res, next) => {
// 	const doctors = await Doctor.find(req.query);
// 	console.log(req.query);
// 	console.log('getAllDoctors');
// 	res.locals.doctors = doctors;
// 	next();
// }
const doctorFileStorage = multer.diskStorage({
    destination: 'public/uploads/doctors',
    filename: function(req, file, callback){
        callback(null, `${req.body.phoneNumber}${path.extname(file.originalname)}`);
    }
})

const uploadDoctor = multer({
    storage: doctorFileStorage,
    limits: {fileSize: 1000000},
}).single('display_picture');


const getAllDoctors = async (req, res, next) => {
    var doctors = [];
    if(req.session.filters){
        if(Object.keys(req.session.filters).length){
            doctors = await User.find({
                $and: [
                    {role: 'doctor'},
                    {
                        "location": {$in: req.session.filters.location ? req.session.filters.location : ['New Delhi', 'Mumbai', 'Bangalore', 'Punjab', 'Ahmedabad', 'Gurgaon']}
                    },
                    // {
                    //     "doctor.hospitalList": { $in: req.session.filters.hospital ?  req.session.filters.hospital : ['Apollo Hospital', 'Rockland Hospital', 'Kokilaben Hospital', 'AIIMS', 'Fortis Hospital', 'Primus Super Speciality Hospital'] }
                    // },
                    {
                        "doctor.experience": { $gte: req.session.filters.experience ?  parseInt(req.session.filters.experience[req.session.filters.experience.length - 1]) : 0 }
                    },
                    {
                        'doctor': { $exists: true }
                    }
                ]
            }).sort(req.session.sortBy ? {[req.session.sortBy.split('-')[0]] : req.session.sortBy.split('-')[1] === 'asc' ? 1 : -1} : []);
        } else {
            doctors = await User.find({
                $and:[
                    {
                        role: 'doctor'
                    },
                    {
                        'doctor': { $exists: true }
                    }
                ]
            }).sort(req.session.sortBy ? { [req.session.sortBy.split('-')[0]] : req.session.sortBy.split('-')[1] == 'asc' ? 1: -1} : []);
        }
    } else {
        doctors = await User.find({
            $and:[
                {
                    role: 'doctor'
                },
                {
                    'doctor': { $exists: true }
                }
            ]
        }).sort(req.session.sortBy ? { [req.session.sortBy.split('-')[0]] : req.session.sortBy.split('-')[1] == 'asc' ? 1: -1} : []);
    }



	// let experience = req.query.experience;
 //    if(experience && experience instanceof Array) {
 //        experience = experience.map(e => Number(e));
 //        experience = Math.min(...experience);
 //    }
 //    // console.log({ role : "doctor", ...req.query, doctor.experience: { $gte : experience || 0 }});
 //    const doctors = await User.find({role: 'doctor',...req.query, "doctor.experience": { $gte : experience || 0 }});         
    
    res.locals.doctors = doctors;
    res.locals.currentDay = new Date().getDay();
    res.locals.currentDate = new Date();
    next();
}

const filterDoctor = async (req, res, next) => {
	const doctors = await Doctor.find(req.query);
	res.locals.doctors = doctors;
	next();
}

const addDoctor = async (req, res, next) => {
    uploadDoctor(req, res, async(err) => {
        if(err){
            req.session.error = err;
            req.session.errorType = 'Failure';
            res.redirect('/add-doctors');
        } else {
            console.log(req.file);
            let hospitals = req.body.hospitalList.slice(1,req.body.hospitalList.length - 1).split(',');
            let achievementList = req.body.achievements.slice(1,req.body.achievements.length - 1).split(',');
            let qualificationList = req.body.qualifications.slice(1,req.body.qualifications.length - 1).split(',');
            let awardsList = req.body.awards.slice(1,req.body.awards.length - 1).split(',');
            let specializationsList = req.body.specializations.slice(1,req.body.specializations.length - 1).split(',');
            // let slotDurationString = req.body.slotDuration.slice(1,req.body.slotDuration.length - 1).split(',');
            let hospitalList = [];
            let achievements = [];
            let qualifications = [];
            let awards = [];
            let specializations = [];
            // let slotDuration = '';
            if(req.body.hospitalList){
                for(let i = 0; i < hospitals.length; i++){
                    value = JSON.parse(hospitals[i]).value;
                    // let hospital = await Hospital.findOne({ name: value }, { _id: 1 });
                    // let id = hospital.id;
                    // console.log(hospital);
                    // console.log(id);
                    hospitalList.push(value);
                }    
            }
            for(let i = 0; i < achievementList.length; i++){
                value = JSON.parse(achievementList[i]).value;
                achievements.push(value);
            }
            if(req.body.awards){
                for(let i = 0; i < awardsList.length; i++){
                    value = JSON.parse(awardsList[i]).value;
                    awards.push(value);
                }    
            }
            for(let i = 0; i < qualificationList.length; i++){
                value = JSON.parse(qualificationList[i]).value;
                qualifications.push(value);
            }
            for(let i = 0; i < specializationsList.length; i++){
                value = JSON.parse(specializationsList[i]).value;
                specializations.push(value);
            }
            // for(let i = 0; i < slotDurationString.length; i++){
            //     slotDuration = JSON.parse(slotDurationString[i]).value.split(' ')[0];
            // }
            // console.log(slotDuration);
            console.log(req.body);
            const newDoctor = await User.create({
                role: 'doctor',
                name: req.body.name,
                gender: req.body.gender,
                dob: req.body.dob,
                location: req.body.location,
                display_picture: '/' + req.file.path,
                email: req.body.email,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                doctor: {
                    specializations: specializations,
                    qualifications: qualifications,
                    awards: awards,
                    avg_fees: req.body.averageFees,
                    hospitalList: hospitalList,
                    // startTime: req.body.startTime,
                    // endTime: req.body.endTime,
                    // slotDuration: slotDuration,
                    achievements: achievements,
                    experience: req.body.experience,
                    description: req.body.description,    
                }
            });
            console.log(newDoctor);
            for(let i = 0; i < newDoctor.doctor.hospitalList.length; i++){
                const hospital = await Hospital.findOne({ name: newDoctor.doctor.hospitalList[i] });
                if(hospital){

                } else {
                    await Hospital.create({
                        name: newDoctor.doctor.hospitalList[i]
                    });
                }
            }
            req.session.error = 'Doctor Registered Succesfully!';
            req.session.errorType = 'Success';
            res.redirect('/add-doctors');
        }
    })
}

// const manuallyPopulateDoctor = async (req, res, next) => {
//     var hospitals = [];
//     for await (hospitalid of req.session.user.doctor.hospitalList){
//         let hospital = await Hospital.findOne({ _id: hospitalid }, {name: 1});
//         hospitals.push(hospital.name);
//     }
//     req.session.user.doctor.hospitalList = hospitals;
//     next();
// }

const deleteDoctor = async (req, res, next) => {
    await User.remove({ _id: req.params.id });
    req.session.error = 'Doctor deleted successfully';
    req.session.errorType = 'Success';
    res.redirect('/admin-doctors');

}

const doctorFilters = (req, res) => {
    req.session.filters = req.body;
    res.redirect('/doctors');
}

const doctorSort = (req, res) => {
    req.session.sortBy = req.body.sort;
    res.redirect('/doctors');
}

const getDoctor = async (req, res, next) => {
    const doctor = await User.findOne({ _id: req.params.id });
    res.locals.doctor = doctor;
    next();
}

const adminEditDoctor = (req, res, next) => {
    uploadDoctor(req, res, async (err) => {
        if(err){
            req.session.error = err;
            req.session.errorType = 'Failure';
            res.redirect('/admin-edit-doctor');
        } else {
            const user = await User.findOne({ email: req.body.email });
            console.log(req.body);
            user.display_picture = req.file === undefined ? req.body.display_picture : '/' + req.file.path;
            user.name = req.body.name;
            user.phoneNumber = req.body.phoneNumber;
            user.email = req.body.email;
            user.gender = req.body.gender;
            user.dob = req.body.dob;
            user.bloodGroup = req.body.bloodGroup;
            user.timeZone = req.body.timeZone;
            user.state = req.body.state;
            user.country = req.body.country;
            user.location = req.body.location;
            let achievementList = req.body.achievements.slice(1,req.body.achievements.length - 1).split(',');
            let qualificationList = req.body.qualifications.slice(1,req.body.qualifications.length - 1).split(',');
            let awardsList = req.body.awards.slice(1,req.body.awards.length - 1).split(',');
            let specializationsList = req.body.specializations.slice(1,req.body.specializations.length - 1).split(',');
            
            let achievements = [];
            let qualifications = [];
            let awards = [];
            let specializations = [];

            for(let i = 0; i < achievementList.length; i++){
                value = JSON.parse(achievementList[i]).value;
                achievements.push(value);
            }
            if(req.body.awards){
                for(let i = 0; i < awardsList.length; i++){
                    value = JSON.parse(awardsList[i]).value;
                    awards.push(value);
                }    
            }
            for(let i = 0; i < qualificationList.length; i++){
                value = JSON.parse(qualificationList[i]).value;
                qualifications.push(value);
            }
            for(let i = 0; i < specializationsList.length; i++){
                value = JSON.parse(specializationsList[i]).value;
                specializations.push(value);
            }

            user.doctor = {
                description: req.body.description,
                achievements: achievements,
                experience: req.body.experience,
                qualifications: qualifications,
                awards: awards,
                specializations: specializations,
                avg_fees: req.body.averageFees,
            }
            await user.save();
            req.session.error = 'Doctor Profile Updated';
            req.session.errorType = 'Success';
            res.redirect(`/admin-edit-doctor/${user._id}`);
        }
    })
}


module.exports = {
	getAllDoctors: getAllDoctors,
    addDoctor: addDoctor,
    deleteDoctor: deleteDoctor,
    // manuallyPopulateDoctor: manuallyPopulateDoctor,
    doctorFilters: doctorFilters,
    doctorSort: doctorSort,
    getDoctor: getDoctor,
    adminEditDoctor: adminEditDoctor
}