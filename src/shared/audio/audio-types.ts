


export interface SoundAttributes {
    key: string;
    assetId: string;
    text?: string; // Optional subtitle text
    volume?: number; // Default volume (0-1)
    loop?: boolean;  // Should the sound loop
    fadeInTime?: number; // Time in seconds to fade in
    fadeOutTime?: number; // Time in seconds to fade out
}