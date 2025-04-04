import type { DocAction, Group } from 'module-wiki';

export function parseTime(time: Date): string {
    const t = new Date(time);
    return `${t.getFullYear()}/${t.getMonth() + 1
        }/${t.getDate()} ${t.getHours()}:${t.getMinutes()}`;
}

// export function calcByte(s: string, b?: number, i?: number, c?: number): number {
//     for (
//         b = i = 0;
//         (c = s.charCodeAt(i++));
//         b += c >> 11 ? 3 : c >> 7 ? 2 : 1
//     );
//     return b;
// }

export const groupArr: Group[] = [
    'any', 'guest', 'user', 'dev', 'system', 'manager', 'blocked'
];

export const docActionArr: DocAction[] = [
    'read',
    'create',
    'edit',
    'move',
    'delete',
    'change_authority',
    'change_state',
];

export const translatedDocActionArr: string[] = [
    '열람',
    '생성',
    '편집',
    '이동',
    '삭제',
    '권한',
    '상태',
]