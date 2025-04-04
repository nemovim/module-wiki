import type { User, UserName } from '../types/user';
import type { PenaltyDoc, PenaltyType, PenaltyId } from '../types/penalty';

import LogController from '../controllers/log.js';
import UserController from '../controllers/user.js';
import PenaltyController from '../controllers/penalty.js';

import AuthorityManager from './authority.js';
import UserManager from './user.js';

export default class PenaltyManager {

    static async #applyPenalty(penaltyType: PenaltyType, penalizedName: UserName, duration: number, comment: string, penalizer: User): Promise<User> {
        if (duration < 0)
            throw new Error('Duration cannot be less than zero!');

        const penalizedUser = await UserController.getUserByName(penalizedName);
        if (!penalizedUser)
            throw new Error('Nonexistant UserEmail!')

        if (!AuthorityManager.canApplyPenalty(penalizedUser.group, penalizer.group))
            throw new Error('Cannot apply penalty!');

        const penalty = {
            penalizedEmail: penalizedUser.email,
            penalizerEmail: penalizer.email,
            type: penaltyType,
            until: new Date(new Date().getTime() + duration * 60 * 1000),
            duration,
            comment,
        }

        await PenaltyController.setPenaltyByPenalty(penalty);
        await LogController.setApplyingPenaltyLogByPenalty(penalty);

        return penalizedUser;

    }

    static async blockUserByName(penalizedName: UserName, duration: number, comment: string, penalizer: User): Promise<void> {
        const penalizedUser = await this.#applyPenalty('block', penalizedName, duration, comment, penalizer);
        await UserManager.changeGroupByEmail(penalizedUser.email, 'blocked', penalizer);
    }

    static async warnUserByName(penalizedName: UserName, duration: number, comment: string, penalizer: User): Promise<void> {
        await this.#applyPenalty('warn', penalizedName, duration, comment, penalizer);
    }

    static async #removePenalty(penaltyId: PenaltyId, comment: string, penalizer: User): Promise<PenaltyDoc> {

        if (!AuthorityManager.canRemovePenalty(penalizer.group))
            throw new Error('Cannot remove penalty!');

        const penalty = await PenaltyController.getPenaltyById(penaltyId);

        if (!penalty)
            throw new Error('The penalty does not exist!');

        await PenaltyController.deletePenaltyById(penaltyId);

        penalty.penalizerEmail = penalizer.email;
        penalty.comment = comment;
        await LogController.setRemovingPenaltyLogByPenalty(penalty);

        return penalty;
    }

    static async removePenaltyById(penaltyId: PenaltyId, comment: string, penalizer: User): Promise<void> {
        const penalty = await this.#removePenalty(penaltyId, comment, penalizer);

        if (penalty.type === 'block') {
            const penaltyArr = await PenaltyController.getPenaltiesByEmailAndType(penalty.penalizedEmail, 'block');
            if (penaltyArr.length === 0)
                await UserManager.changeGroupByEmail(penalty.penalizedEmail, 'user', penalizer);

        }
    }

    static async refreshPenaltiesByName(penalizedName: UserName): Promise<PenaltyDoc[]> {
        const user = await UserController.getUserByName(penalizedName);
        if (!user)
            throw new Error('The user does not exist!');

        const penaltyArr = await PenaltyController.getAllPenaltiesByEmail(user.email);
        const validPenaltyArr: PenaltyDoc[] = [];
        const expiredPenaltyIdArr: PenaltyId[] = [];

        for (let penalty of penaltyArr) {
            if (penalty.duration !== 0 && new Date(penalty.until).getTime() < new Date().getTime())
                expiredPenaltyIdArr.push(penalty._id as PenaltyId);
            else
                validPenaltyArr.push(penalty);
        }

        await PenaltyController.deletePenaltiesByIdArr(expiredPenaltyIdArr);

        if (user.group === 'blocked') {
            const isBlocked = validPenaltyArr.reduce((prev, penalty) => {
                if (penalty.type === 'block') return true;
                else return prev;
            }, false);
            if (!isBlocked)
                await UserManager.changeGroupByEmail(user.email, 'user', AuthorityManager.getSystemUser());
        }

        return validPenaltyArr;
    }
}
