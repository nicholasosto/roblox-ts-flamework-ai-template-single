/**
 * Branded asset URI types for compile-time safety.
 *
 * These types prevent accidentally assigning an AnimationAsset where an
 * ImageAsset is expected, even though both are string-based URIs at runtime.
 */

/** Base asset URI type – all Roblox assets follow this pattern. */
export type AssetUri = `rbxassetid://${number}`;

/**
 * Animation asset URI.
 * Use for Animator:LoadAnimation(), Animation.AnimationId, etc.
 */
export type AnimationAsset = AssetUri & { readonly __brand: "AnimationAsset" };

/**
 * Image asset URI.
 * Use for ImageLabel.Image, ImageButton.Image, Decal.Texture, etc.
 */
export type ImageAsset = AssetUri & { readonly __brand: "ImageAsset" };

/**
 * Audio asset URI.
 * Use for Sound.SoundId, SoundService, etc.
 */
export type AudioAsset = AssetUri & { readonly __brand: "AudioAsset" };

/**
 * Mesh asset URI.
 * Use for MeshPart.MeshId, SpecialMesh.MeshId, etc.
 */
export type MeshAsset = AssetUri & { readonly __brand: "MeshAsset" };

/**
 * Helper to cast a raw rbxassetid string to a branded asset type.
 * Use sparingly – prefer the pre-typed constants in AssetId.
 */
export function asAnimationAsset(id: AssetUri): AnimationAsset {
	return id as AnimationAsset;
}

export function asImageAsset(id: AssetUri): ImageAsset {
	return id as ImageAsset;
}

export function asAudioAsset(id: AssetUri): AudioAsset {
	return id as AudioAsset;
}

export function asMeshAsset(id: AssetUri): MeshAsset {
	return id as MeshAsset;
}
