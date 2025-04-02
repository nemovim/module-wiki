export function parseTime(time: Date): string {
    const t = new Date(time);
    return `${t.getFullYear()}/${t.getMonth() + 1
        }/${t.getDate()} ${t.getHours()}:${t.getMinutes()}`;
}

export function calcByte(s: string, b?: number, i?: number, c?: number): number {
        for (
            b = i = 0;
            (c = s.charCodeAt(i++));
            b += c >> 11 ? 3 : c >> 7 ? 2 : 1
        );
        return b;
    }