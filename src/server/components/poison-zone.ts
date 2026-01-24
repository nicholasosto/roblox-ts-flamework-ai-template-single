import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Character } from "@rbxts/wcs";
import { Poisoned } from "shared/combat/status-effects/poisoned";
import { createLogger } from "shared/utils";

const log = createLogger("component:PoisonZone");

/**
 * Attributes for the PoisonZone component
 */
interface PoisonZoneAttributes {
	/** Damage per tick while in zone (default: 5) */
	damage?: number;
	/** Duration of poison after leaving zone (default: 4 seconds) */
	poisonDuration?: number;
	/** Cooldown between poison applications (default: 1 second) */
	reapplyCooldown?: number;
	/** Whether zone is currently active (default: true) */
	enabled?: boolean;
}

/**
 * PoisonZone Component (Server-Side)
 *
 * Attach this to any Part by adding the tag "se:Poison"
 * When a character touches or stands in the zone, they receive the Poisoned status effect.
 *
 * Attributes:
 * - damage: Damage per tick (default: 5)
 * - poisonDuration: How long poison lasts after leaving (default: 4s)
 * - reapplyCooldown: Time between reapplying poison while standing in zone (default: 1s)
 * - enabled: Whether the zone is active (default: true)
 */
@Component({ tag: "se:Poison" })
export class PoisonZone extends BaseComponent<PoisonZoneAttributes, BasePart> implements OnStart {
	// Track characters in zone and their last poison time
	private charactersInZone = new Map<Character, number>();
	private touchConnection?: RBXScriptConnection;
	private touchEndConnection?: RBXScriptConnection;
	private tickConnection?: RBXScriptConnection;

	// Default values (damage is configured on the Poisoned status effect)
	private getPoisonDuration(): number {
		return this.attributes.poisonDuration ?? 4;
	}

	private getReapplyCooldown(): number {
		return this.attributes.reapplyCooldown ?? 1;
	}

	private getIsEnabled(): boolean {
		return this.attributes.enabled ?? true;
	}

	onStart(): void {
		log.info(`PoisonZone attached to ${this.instance.Name}`);

		// Ensure the part can detect touches
		this.instance.CanTouch = true;

		// Connect touch events
		this.touchConnection = this.instance.Touched.Connect((hit) => this.onTouched(hit));
		this.touchEndConnection = this.instance.TouchEnded.Connect((hit) => this.onTouchEnded(hit));

		// Start tick loop for characters standing in zone
		this.startZoneTick();

		// Listen for enabled attribute changes
		this.onAttributeChanged("enabled", (enabled) => {
			if (!enabled) {
				// Clear all tracked characters when disabled
				this.charactersInZone.clear();
			}
		});
	}

	destroy(): void {
		// Cleanup connections
		this.touchConnection?.Disconnect();
		this.touchEndConnection?.Disconnect();
		this.tickConnection?.Disconnect();
		this.charactersInZone.clear();

		log.info(`PoisonZone destroyed: ${this.instance.Name}`);
	}

	/**
	 * Handle a part touching the poison zone
	 */
	private onTouched(hit: BasePart): void {
		if (!this.getIsEnabled()) return;

		const character = this.getCharacterFromPart(hit);
		if (!character) return;

		// Add to tracked characters if not already there
		if (!this.charactersInZone.has(character)) {
			this.charactersInZone.set(character, 0); // 0 = apply immediately
			log.debug(`Character entered poison zone: ${character.Instance.Name}`);
		}
	}

	/**
	 * Handle a part leaving the poison zone
	 */
	private onTouchEnded(hit: BasePart): void {
		const character = this.getCharacterFromPart(hit);
		if (!character) return;

		// Check if ANY part of the character is still touching
		// Small delay to handle rapid touch/untouch
		task.delay(0.1, () => {
			if (!this.isCharacterStillInZone(character)) {
				this.charactersInZone.delete(character);
				log.debug(`Character left poison zone: ${character.Instance.Name}`);
			}
		});
	}

	/**
	 * Tick loop that applies poison to characters in zone
	 */
	private startZoneTick(): void {
		const RunService = game.GetService("RunService");

		this.tickConnection = RunService.Heartbeat.Connect(() => {
			if (!this.getIsEnabled()) return;

			const now = os.clock();

			for (const [character, lastApplyTime] of this.charactersInZone) {
				// Check cooldown
				if (now - lastApplyTime >= this.getReapplyCooldown()) {
					this.applyPoisonToCharacter(character);
					this.charactersInZone.set(character, now);
				}
			}
		});
	}

	/**
	 * Apply or refresh poison on a character
	 */
	private applyPoisonToCharacter(character: Character): void {
		// Use the static helper which handles stacking
		Poisoned.applyTo(character, this.getPoisonDuration());
		log.debug(`Applied poison to ${character.Instance.Name}`);
	}

	/**
	 * Get WCS Character from a hit part
	 */
	private getCharacterFromPart(part: BasePart): Character | undefined {
		// Find the character model
		const characterModel = part.FindFirstAncestorOfClass("Model");
		if (!characterModel) return undefined;

		// Check if it has a humanoid (is a character)
		const humanoid = characterModel.FindFirstChildOfClass("Humanoid");
		if (!humanoid || humanoid.Health <= 0) return undefined;

		// Get WCS character wrapper
		return Character.GetCharacterFromInstance(characterModel);
	}

	/**
	 * Check if any part of a character is still in the zone
	 */
	private isCharacterStillInZone(character: Character): boolean {
		const characterModel = character.Instance as Model;

		// Get all touching parts
		const touchingParts = this.instance.GetTouchingParts();

		for (const part of touchingParts) {
			if (part.IsDescendantOf(characterModel)) {
				return true;
			}
		}

		return false;
	}
}
