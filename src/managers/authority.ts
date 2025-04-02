import type { Info } from '../types/info';
import type { Group } from '../types/authority';
import type { User, UserEmail, UserName } from '../types/user';
import type { DocAction } from '../types/log';

export default class AuthorityManager {

    static getSystemUser(): User {
        return {
            email: '<SYSTEM>@<SYSTEM>' as UserEmail,
            name: '<SYSTEM>' as UserName,
            group: 'system',
        }
    }

    static canWriteNewWiki(userGroup: Group): boolean {
        return ['system', 'manager', 'dev'].includes(userGroup);
    }

    static isAuthorized(groupArr: Group[] | undefined, group: Group): boolean {
        if (group === 'blocked')
            return false;
        if (groupArr?.includes(group))
            return true;
        if (groupArr?.includes('any'))
            return true;
        return false;
    }

    static canDo(action: DocAction, docInfo: Info, userGroup: Group): boolean {
        if (action === 'state') {
            return this.isAuthorized(docInfo.authority[action], userGroup);
        } else if (action === 'read') {
            return this.isAuthorized(docInfo.authority[action], userGroup) || (userGroup === 'blocked' && (docInfo.authority[action] || []).includes('any'));
        } else if (docInfo.type === 'category') {
            if (action === 'write' && (docInfo.state === 'deleted' || docInfo.state === 'new'))
                return userGroup === 'system';
            else if (action === 'delete' || action === 'move')
                return userGroup === 'system';
            else
                return this.isAuthorized(docInfo.authority[action], userGroup) && (docInfo.state !== 'forbidden');
        } else {
            return this.isAuthorized(docInfo.authority[action], userGroup) && (docInfo.state !== 'forbidden');
        }
    }

    static canApplyPenalty(penalizedGroup: Group, userGroup: Group): boolean {
        return ['manager', 'system', 'dev'].includes(userGroup) && !['system', 'dev'].includes(penalizedGroup);
    }

    static canRemovePenalty(userGroup: Group): boolean {
        return ['manager', 'system', 'dev'].includes(userGroup);
    }

    static canChangeName(user: User, operator: User): boolean {
        return (user.email === operator.email) || (['system', 'manager', 'dev'].includes(operator.group) && !['system', 'dev'].includes(user.group));
    }

    static canChangeGroup(user: User, operator: User): boolean {
        return (['system', 'manager', 'dev'].includes(operator.group) && !['system', 'dev'].includes(user.group));
    }
}