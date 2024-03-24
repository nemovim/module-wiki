import User from '../models/user.js';

export default class UserManager {
    static async getUserByEmail(email) {
        return await User.findOne({
            email,
        });
    }

    static async setUserByEmailAndName(email, name) {
        const user = new User({
            email,
            name,
            authority: 1,
        });
        return await user.save();
    }
}
