import { StatusEffect, StatusEffectDecorator, Character } from "@rbxts/wcs";
import { SFX_CATALOG } from "shared/audio";
import { ReplicatedStorage } from "@rbxts/services";

/**
 * Poisoned Status Effect
 *
 * Deals damage over time to the afflicted character.
 * - Configurable damage per tick, tick rate, and duration
 * - Stacking: refreshes duration and increases intensity (capped)
 * - Visual: Green particle effect from SSGamePackage
 * - Audio: Poison apply/tick sounds from SFX_CATALOG
 */
@StatusEffectDecorator
export class Poisoned extends StatusEffect {
	// ===== CONFIGURATION =====
	private static readonly BASE_DAMAGE_PER_TICK = 5;
	private static readonly TICK_RATE = 1; // seconds between ticks
	private static readonly MAX_STACKS = 5;
	private static readonly DEFAULT_DURATION = 6; // seconds

	// Damage modification priority (lower = applies first)
	public DamageModificationPriority = 1;
	public DestroyOnEnd = true;

	// ===== STATE =====
	private stacks = 1;
	private tickConnection?: RBXScriptConnection;

	// Client-side VFX
	private particleAttachment?: Attachment;
	private particleEmitter?: ParticleEmitter;

	// ===== LIFECYCLE - SERVER =====

	public OnConstructServer() {
		// Initialize with default stacks
		this.stacks = 1;
	}

	public OnStartServer() {
		print(`[Poisoned] Applied to ${this.Character.Instance.Name} with ${this.stacks} stacks`);

		// Optional: Slight movement slow while poisoned
		// SetHumanoidData uses tuple format: [value, "Set" | "Increment"]
		this.SetHumanoidData({
			WalkSpeed: [14, "Set"], // Slightly slowed from default 16
		});

		// Start damage ticks
		this.startDamageTicks();
	}

	public OnEndServer() {
		print(`[Poisoned] Removed from ${this.Character.Instance.Name}`);

		// Stop damage ticks
		this.stopDamageTicks();

		// Humanoid data is automatically restored by WCS
	}

	// ===== LIFECYCLE - CLIENT =====

	public OnStartClient() {
		const characterModel = this.Character.Instance as Model;
		const rootPart = characterModel.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

		if (!rootPart) {
			warn("[Poisoned] No HumanoidRootPart found for VFX");
			return;
		}

		// Create VFX
		this.createPoisonVFX(rootPart);

		// Play apply sound
		this.playSound(SFX_CATALOG.status_poison_apply, rootPart, false);
	}

	public OnEndClient() {
		// Cleanup VFX
		this.cleanupVFX();

		// Play cure sound (optional)
		const rootPart = (this.Character.Instance as Model).FindFirstChild(
			"HumanoidRootPart",
		) as BasePart;
		if (rootPart) {
			this.playSound(SFX_CATALOG.status_poison_cure, rootPart, false);
		}
	}

	// ===== PUBLIC METHODS =====

	/**
	 * Add a stack of poison (call from skills to intensify effect)
	 * Refreshes duration and increases damage
	 */
	public addStack(): void {
		if (this.stacks < Poisoned.MAX_STACKS) {
			this.stacks += 1;
			print(`[Poisoned] Stacks increased to ${this.stacks}`);
		}
	}

	/**
	 * Get current stack count
	 */
	public getStacks(): number {
		return this.stacks;
	}

	/**
	 * Get damage per tick (scales with stacks)
	 */
	public getDamagePerTick(): number {
		return Poisoned.BASE_DAMAGE_PER_TICK * this.stacks;
	}

	// ===== PRIVATE - DAMAGE SYSTEM =====

	private startDamageTicks(): void {
		// Use task.spawn with while loop for tick-based damage
		this.tickConnection = task.spawn(() => {
			while (this.GetState().IsActive) {
				task.wait(Poisoned.TICK_RATE);

				// Check if still active after wait
				if (!this.GetState().IsActive) break;

				this.applyTickDamage();
			}
		}) as unknown as RBXScriptConnection;

		// Alternative: Use a connection-based approach
		// This is cleaner for cleanup
		let elapsed = 0;
		const connection = game.GetService("RunService").Heartbeat.Connect((dt) => {
			elapsed += dt;
			if (elapsed >= Poisoned.TICK_RATE) {
				elapsed -= Poisoned.TICK_RATE;
				this.applyTickDamage();
			}
		});

		// Store connection for cleanup
		this.tickConnection = connection;
	}

	private stopDamageTicks(): void {
		if (this.tickConnection) {
			this.tickConnection.Disconnect();
			this.tickConnection = undefined;
		}
	}

	private applyTickDamage(): void {
		const damage = this.getDamagePerTick();

		// Create damage container - WCS expects { Damage, Source }
		const damageContainer = {
			Damage: damage,
			Source: this,
		};

		// Apply damage to self (poison hurts the affected character)
		this.Character.TakeDamage(damageContainer);

		print(`[Poisoned] Tick damage: ${damage} (${this.stacks} stacks)`);
	}

	// ===== PRIVATE - VFX =====

	private createPoisonVFX(rootPart: BasePart): void {
		// Create attachment for particles
		this.particleAttachment = new Instance("Attachment");
		this.particleAttachment.Name = "PoisonedVFX";
		this.particleAttachment.Parent = rootPart;

		// Try to clone from SSGamePackage, fallback to creating manually
		const gamePackage = ReplicatedStorage.FindFirstChild("SSGamePackage") as Folder | undefined;
		const statusEffects = gamePackage?.FindFirstChild("Effects")?.FindFirstChild("Status") as
			| Model
			| undefined;
		const poisonTemplate = statusEffects?.FindFirstChild("Poisoned") as
			| ParticleEmitter
			| undefined;

		if (poisonTemplate) {
			// Clone existing particle emitter from assets
			this.particleEmitter = poisonTemplate.Clone();
			this.particleEmitter.Parent = this.particleAttachment;
			this.particleEmitter.Enabled = true;
		} else {
			// Fallback: Create particle emitter manually
			this.particleEmitter = this.createFallbackParticles();
			this.particleEmitter.Parent = this.particleAttachment;
		}
	}

	private createFallbackParticles(): ParticleEmitter {
		const emitter = new Instance("ParticleEmitter");
		emitter.Name = "PoisonParticles";

		// Poison green color
		emitter.Color = new ColorSequence(Color3.fromRGB(100, 200, 100));

		// Size: small bubbles
		emitter.Size = new NumberSequence([
			new NumberSequenceKeypoint(0, 0.2),
			new NumberSequenceKeypoint(0.5, 0.4),
			new NumberSequenceKeypoint(1, 0),
		]);

		// Transparency: fade out
		emitter.Transparency = new NumberSequence([
			new NumberSequenceKeypoint(0, 0.3),
			new NumberSequenceKeypoint(1, 1),
		]);

		// Behavior
		emitter.Rate = 15;
		emitter.Lifetime = new NumberRange(1, 2);
		emitter.Speed = new NumberRange(1, 3);
		emitter.SpreadAngle = new Vector2(180, 180);
		emitter.RotSpeed = new NumberRange(-45, 45);
		emitter.LightEmission = 0.3;

		// Emit upward (poison fumes rising)
		emitter.EmissionDirection = Enum.NormalId.Top;

		return emitter;
	}

	private cleanupVFX(): void {
		// Disable emission first
		if (this.particleEmitter) {
			this.particleEmitter.Enabled = false;
		}

		// Wait for particles to fade, then destroy
		const attachment = this.particleAttachment;
		if (attachment) {
			task.delay(2, () => {
				attachment.Destroy();
			});
		}

		this.particleEmitter = undefined;
		this.particleAttachment = undefined;
	}

	/**
	 * Burst particles on damage tick (call from metadata change listener)
	 */
	public burstParticles(count = 10): void {
		this.particleEmitter?.Emit(count);
	}

	// ===== PRIVATE - AUDIO =====

	private playSound(soundId: string, parent: BasePart, looped: boolean): Sound {
		const sound = new Instance("Sound");
		sound.SoundId = soundId;
		sound.Volume = 0.5;
		sound.RollOffMaxDistance = 50;
		sound.Looped = looped;
		sound.Parent = parent;
		sound.Play();

		// Auto-cleanup non-looped sounds
		if (!looped) {
			sound.Ended.Once(() => sound.Destroy());
		}

		return sound;
	}

	// ===== STATIC HELPER =====

	/**
	 * Apply or refresh poison on a target character
	 * Use this from skills to properly handle stacking
	 */
	public static applyTo(target: Character, duration = Poisoned.DEFAULT_DURATION): Poisoned {
		// Check if target already has poison
		const existingPoison = target
			.GetAllStatusEffects()
			.find((effect) => effect.Name === "Poisoned") as Poisoned | undefined;

		if (existingPoison && existingPoison.GetState().IsActive) {
			// Add stack and refresh duration
			existingPoison.addStack();
			existingPoison.Start(duration); // Refresh duration
			return existingPoison;
		}

		// Apply new poison
		const poison = new Poisoned(target);
		poison.Start(duration);
		return poison;
	}
}
