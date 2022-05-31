export interface MembershipPayload {
    avatarURL?: string;
    id?: string;
    username?: string;
    discriminator?: string;
    color?: string;
    title?: string;
}

export interface APIResponse {
    ambassador: MembershipPayload[];
    supporter: MembershipPayload[];
    booster: MembershipPayload[];
    administrator: MembershipPayload[];
    moderator: MembershipPayload[];
    helper: MembershipPayload[];
}
