import { StatusEffect, StatusEffectDecorator } from "@rbxts/wcs";

@StatusEffectDecorator
export class MyStatusEffect extends StatusEffect {
	// Set damage modification priority (higher = applies later)
	public DamageModificationPriority = 1;

	// Set whether to destroy on end (default: true)
	public DestroyOnEnd = true;

	public OnConstructServer() {
		// Server-specific initialization
	}

	public OnConstructClient() {
		// Client-specific initialization
	}

	public OnStartServer() {
		print("Status effect started on server!");

		// Modify humanoid properties
		this.SetHumanoidData({
			WalkSpeed: 32, // Set walk speed to 32
			JumpPower: 100, // Set jump power to 100
		});
	}

	public OnStartClient() {
		print("Status effect started on client!");
		// Client-side visual effects
	}

	public OnEndServer() {
		// Server-side cleanup
		// Humanoid properties are automatically restored
	}

	public OnEndClient() {
		// Client-side cleanup
	}

	// Override HandleDamage to modify incoming/outgoing damage
	public HandleDamage(modified: number, original: number, source?: any) {
		// Modify damage taken/dealt by this character
		// Return the modified damage value
		return modified * 1.5; // Example: increase damage by 50%
	}
}
