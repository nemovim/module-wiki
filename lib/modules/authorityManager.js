export default class AuthorityManager {

    static canRead(info, userAuthority) {
        return (userAuthority >= info.authorityObj.read) && (info.state === 'normal');
    }

    static canWrite(info, userAuthority) {
        return (userAuthority >= info.authorityObj.write) && (info.state === 'normal');
    }

    static canDelete(info, userAuthority) {
        return (userAuthority >= info.authorityObj.delete) && (info.state === 'normal');
    }

    static canUpdate(info, userAuthority) {
        return (userAuthority >= info.authorityObj.update) && (info.state === 'normal');
    }

}