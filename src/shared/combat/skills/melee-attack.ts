import { Skill, SkillDecorator, Character } from "@rbxts/wcs";

/**
 * Simple Melee Attack Skill
 * A basic melee attack that deals damage to nearby enemies
 */
@SkillDecorator
export class MeleeAttack extends Skill {
	// Configuration
	private readonly DAMAGE = 25;
	private readonly RANGE = 5;
	private readonly COOLDOWN = 1;

	public OnConstruct() {
		// Set mutual exclusives to prevent spamming
		this.MutualExclusives = [];
	}

	public OnStartServer() {
		const character = this.Character;
		const humanoidRootPart = character.Instance.FindFirstChild("HumanoidRootPart") as
			| BasePart
			| undefined;

		if (!humanoidRootPart) {
			warn("[MeleeAttack] No HumanoidRootPart found");
			return;
		}

		// Find enemies in range
		const hitTargets = this.getTargetsInRange(humanoidRootPart.Position, this.RANGE);

		// Deal damage to each target
		for (const target of hitTargets) {
			const damageContainer = this.CreateDamageContainer(this.DAMAGE);
			target.TakeDamage(damageContainer);
			print(`[MeleeAttack] Hit ${target.Instance.Name} for ${this.DAMAGE} damage`);
		}

		// Apply cooldown
		this.ApplyCooldown(this.COOLDOWN);

		print(`[MeleeAttack] Attack completed, hit ${hitTargets.size()} targets`);
	}

	public OnStartClient() {
		// Client-side effects (animations, sounds, VFX)
		print("[MeleeAttack] Playing attack animation on client");

		const character = this.Character;
		const humanoid = character.Instance.FindFirstChildOfClass("Humanoid");

		if (humanoid) {
			// Play attack animation if animator exists
			const animator = humanoid.FindFirstChildOfClass("Animator");
			if (animator) {
				// You can load and play an animation here
				// const attackAnim = animator.LoadAnimation(animationInstance);
				// attackAnim.Play();
			}
		}
	}

	public OnEndServer() {
		// Server cleanup if needed
	}

	public OnEndClient() {
		// Client cleanup if needed
	}

	/**
	 * Get all WCS characters within range (excluding self)
	 */
	private getTargetsInRange(origin: Vector3, range: number) {
		const targets: Character[] = [];

		// Get all WCS characters from the character map
		const characterMap = Character.GetCharacterMap();

		for (const [, wcsChar] of characterMap) {
			// Skip self
			if (wcsChar === this.Character) continue;

			const rootPart = wcsChar.Instance.FindFirstChild("HumanoidRootPart") as
				| BasePart
				| undefined;
			if (!rootPart) continue;

			// Check if within range
			const distance = origin.sub(rootPart.Position).Magnitude;
			if (distance <= range) {
				targets.push(wcsChar);
			}
		}

		return targets;
	}
}
