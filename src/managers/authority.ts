import type { Info } from '../types/info';
import type { Group } from '../types/authority';
import type { User, UserEmail, UserName } from '../types/user';
import type { DocAction } from '../types/log';

export default class AuthorityManager {

    static isGroup(group: string): boolean {
        const groupArr: Group[] = ['none', 'any', 'guest', 'user', 'dev', 'system', 'manager', 'blocked'];
        return groupArr.includes(group as Group);
    }

    static getSystemUser(): User {
        return {
            email: '<SYSTEM>@<SYSTEM>' as UserEmail,
            name: '<SYSTEM>' as UserName,
            group: 'system',
        }
    }

    static canCreateWiki(userGroup: Group): boolean {
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
        if (userGroup === 'system')
            return true;
        if ((docInfo.authority[action] || []).includes('none'))
            return false;

        if (docInfo.state === 'forbidden') {
            if (!['dev', 'manager'].includes(userGroup) || ['create', 'edit'].includes(action))
                throw new Error('This document is forbidden!')
            else return true;
        }
        if (action === 'change_authority' && (docInfo.authority[action] || []).includes('none'))
            return false;

        if (action === 'read' && userGroup === 'blocked' && (docInfo.authority[action] || []).includes('any'))
            return true;

        return this.isAuthorized(docInfo.authority[action], userGroup);
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