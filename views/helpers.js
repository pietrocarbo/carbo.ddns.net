exports.active = function (param, options) {
   // console.log(arguments);
    switch (param) {
        case 'home':
            this.homeActive = 'active';
            break;
        case 'weather':
            this.weatherActive = 'active';
            break;
        case 'login':
            this.loginActive = 'active';
            break;
        case 'register':
            this.registerActive = 'active';
            break;
        case 'contact':
            this.contactActive = 'active';
            break;
    }
    return options.fn(this);
};

exports.id = function (auth, username, options) {
    // console.log(arguments);
    if (!auth || auth === false) return options.fn(this);
    else {
        return options.inverse(username);
    }
};