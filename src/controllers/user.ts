import type { UserDoc, User, UserEmail, UserName } from '../types/user';
import type { Group } from '../types/authority';

import UserModel from '../models/user';

export default class UserController {
    static async getUserByEmail(email: UserEmail): Promise<UserDoc|null> {
        return await UserModel.findOne({
            email,
        });
    }

    static async getUserByName(name: UserName): Promise<UserDoc|null> {
        return await UserModel.findOne({
            name,
        });
    }

    static async updateNameByUser(user: UserDoc, name: UserName): Promise<UserDoc> {
        if ((await this.getUserByName(name)) !== null) {
            throw new Error('Duplicate UserName');
        }
        user.name = name;
        return await user.save();
    }

    static async updateGroupByUser(user: UserDoc, group: Group): Promise<UserDoc> {
        console.log(user)
        user.group = group;
        return await user.save();
    }

    static async setUserByEmailAndName(email: UserEmail, name: UserName): Promise<UserDoc> {
        if ((await this.getUserByName(name)) !== null) {
            throw new Error('Duplicate UserName');
        }

        const user = new UserModel<User>({
            email,
            name,
            group: 'user'
        });
        return await user.save();
    }

    static async deleteUserByUser(user: UserDoc): Promise<void> {
        await user.deleteOne();
    }
}
