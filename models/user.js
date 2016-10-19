var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'), SALT_WORK_FACTOR = 10; 

var userSchema = new mongoose.Schema({
	username: {type: String, index: true, unique: true, lowercase: true, trim: true}, 
    password: String
});

userSchema.pre('save', function (next) {
    var user = this;
    if(!user.isModified('password'))    return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err)    return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePasswords = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err)    callback(err);
        callback(undefined, isMatch);
    });
}; 

var User = mongoose.model('User', userSchema);

module.exports = User;