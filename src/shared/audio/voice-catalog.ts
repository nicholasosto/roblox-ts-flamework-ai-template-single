import { SoundAttributes } from "./audio-types";

export const TriggerKey = ['Greeting', 'Phase2', 'Phase3', 'Defeated', 'Taunt1', 'Taunt2', 'DamageReaction'] as const;
export type TriggerKeyType = (typeof TriggerKey)[number];
export const enum PenitentKnightDialog {
    Greeting = "I stood watch while the world bled. Do not ask me now to look away.",
    Phase2 = "Guilt is heavier than steel… and I have carried it an age.",
    Phase3 = "If absolution exists—then carve it from me.”",
    Defeated = "You have bested me... for now.",
    Taunt1 = "Your soul trembles. I remember that feeling.",
    Taunt2 = "Every strike you land… I have already judged",
    DamageReaction = "Argh! You'll pay for that!",
}

export const PenitentKnightVoiceCatalog: Record<TriggerKeyType, SoundAttributes> = {
    Greeting: {
        key: "PenitentKnight_Greeting",
        assetId: "rrbxassetid://92246731941536",
        text: "I stood watch while the world bled. Do not ask me now to look away.",
        volume: 0.8,
    },
    Phase2: {
        key: "PenitentKnight_Phase2",
        assetId: "rbxassetid://85615892150460",
        text: "Guilt is heavier than steel… and I have carried it an age.",
        volume: 0.8,
    },
    Phase3: {
        key: "PenitentKnight_Phase3",
        assetId: "rbxassetid://102166397498866",
        text: "If absolution exists—then carve it from me.”",
        volume: 0.8,
    },
    Defeated: {
        key: "PenitentKnight_Defeated",
        assetId: "rbxassetid://45678901",
        text: "You have bested me... for now.",
        volume: 0.8,
    },
    Taunt1: {
        key: "PenitentKnight_Taunt1",
        assetId: "rbxassetid://108148884421041",
        text: "Your soul trembles. I remember that feeling.",
        volume: 0.8,
    },
    Taunt2: {
        key: "PenitentKnight_Taunt2",
        assetId: "rbxassetid://91716758677776",
        text: "Every strike you land… I have already judged",
        volume: 0.8,
    },
    DamageReaction: {
        key: "PenitentKnight_DamageReaction",
        assetId: "rbxassetid://85320371161082",
        text: "Argh! You'll pay for that!",
        volume: 0.8,
    },
};