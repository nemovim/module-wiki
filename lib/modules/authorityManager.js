export default class AuthorityManager {

    static canRead(info, userAuthority) {
        return (userAuthority >= info.authorityObj.read) && (info.state !== 'forbidden');
    }

    static canWrite(info, userAuthority) {
        return (userAuthority >= info.authorityObj.write) && (info.state !== 'forbidden');
    }

    static canWriteNewWiki(userAuthority) {
        return (userAuthority >= 100);
    }

    static canUpdateAuthority(userAuthority) {
        return (userAuthority >= 100);
    }

    static canDelete(info, userAuthority) {
        return (userAuthority >= info.authorityObj.delete) && (info.state === 'normal');
    }

    static canUpdate(info, userAuthority) {
        return (userAuthority >= info.authorityObj.update) && (info.state === 'normal');
    }

}