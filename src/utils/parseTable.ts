import { MembershipPayload } from "../typings";

export function parseTable(members: MembershipPayload[]): string[][] {
    // Maximum column
    const result: string[][] = [];
    for (const member of members) {
        let availableIndex = 0;
        if (result[availableIndex]?.length >= 7) {
            while ((result[availableIndex] ?? []).length >= 7) {
                availableIndex += 1;
            }
        }
        if (!Array.isArray(result[availableIndex])) result[availableIndex] = [];
        result[availableIndex].push(`
<td align="center"><a href="https://zhycorp.org/staff"><img src="${member.avatarURL!}" width="100px;" alt=""/><br /><sub><b>${member.username!}#${member.discriminator!}</b></sub></a><br/></td>
        `.trim());
    }
    return result;
}
