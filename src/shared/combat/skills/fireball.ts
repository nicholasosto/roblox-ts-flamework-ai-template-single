import { Skill, SkillDecorator, Character } from "@rbxts/wcs";
import { RunService } from "@rbxts/services";
import { ProjectileBase, ProjectileConfig } from "../projectiles/projectile-base";
import { getCharacterLookDirection, ProjectileHitResult } from "../utils/raycast-utils";

/**
 * Fireball Skill
 * Launches a fireball projectile in the direction the character is facing.
 * Server-authoritative hit detection with client-side visuals.
 */
@SkillDecorator
export class Fireball extends Skill {
	// Configuration
	private readonly CONFIG: ProjectileConfig = {
		speed: 80, // Studs per second
		maxRange: 100, // Max travel distance
		damage: 35, // Damage on hit
		gravity: 0, // No gravity (straight line)
		pierce: 0, // Stop on first hit
		radius: 1, // Visual radius
	};

	private readonly COOLDOWN = 2; // Seconds

	// Server state
	private serverProjectile?: ProjectileBase;

	// Client state
	private clientVisual?: BasePart;

	public OnConstruct() {
		this.MutualExclusives = [];
	}

	// ===== SERVER =====

	public OnStartServer() {
		const characterModel = this.Character.Instance as Model;
		const rootPart = characterModel.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

		if (!rootPart) {
			warn("[Fireball] No HumanoidRootPart found");
			return;
		}

		// Get look direction
		const direction = getCharacterLookDirection(characterModel);
		if (!direction) {
			warn("[Fireball] Could not get look direction");
			return;
		}

		// Calculate spawn position (slightly in front of character)
		const spawnOffset = direction.mul(2);
		const spawnPosition = rootPart.Position.add(spawnOffset);

		// Create projectile with character filtered out
		const filterInstances: Instance[] = [characterModel];

		this.serverProjectile = new ProjectileBase(
			this.CONFIG,
			spawnPosition,
			direction,
			filterInstances,
		);

		// Handle hit
		this.serverProjectile.onHit = (result) => this.onProjectileHit(result);

		// Handle destroy
		this.serverProjectile.onDestroy = (position) => {
			print(`[Fireball] Projectile destroyed at ${position}`);
		};

		// Start projectile simulation
		this.serverProjectile.start();

		// Apply cooldown
		this.ApplyCooldown(this.COOLDOWN);

		print("[Fireball] Launched fireball!");
	}

	public OnEndServer() {
		// Cleanup projectile if still active
		this.serverProjectile?.destroy();
		this.serverProjectile = undefined;
	}

	/**
	 * Handle projectile hit (server)
	 */
	private onProjectileHit(result: ProjectileHitResult) {
		print(`[Fireball] Hit at ${result.position}`);

		if (result.character && result.humanoid) {
			// Find WCS character wrapper
			const targetWcsChar = Character.GetCharacterFromInstance(result.character);

			if (targetWcsChar && targetWcsChar !== this.Character) {
				// Deal damage
				const damageContainer = this.CreateDamageContainer(this.CONFIG.damage);
				targetWcsChar.TakeDamage(damageContainer);
				print(`[Fireball] Dealt ${this.CONFIG.damage} damage to ${result.character.Name}`);
			}
		}

		// Could spawn explosion effect here via remote
	}

	// ===== CLIENT =====

	public OnStartClient() {
		const characterModel = this.Character.Instance as Model;
		const rootPart = characterModel.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

		if (!rootPart) {
			warn("[Fireball] Client: No HumanoidRootPart found");
			return;
		}

		// Get look direction
		const direction = getCharacterLookDirection(characterModel);
		if (!direction) {
			warn("[Fireball] Client: Could not get look direction");
			return;
		}

		// Calculate spawn position
		const spawnOffset = direction.mul(2);
		const spawnPosition = rootPart.Position.add(spawnOffset);

		// Create visual projectile
		this.clientVisual = this.createFireballVisual();
		this.clientVisual.Position = spawnPosition;
		this.clientVisual.Parent = game.Workspace;

		print(`[Fireball] Client visual spawned at ${spawnPosition}`);

		// Animate the visual independently (not tied to skill lifecycle)
		const velocity = direction.mul(this.CONFIG.speed);
		let distanceTraveled = 0;
		const maxRange = this.CONFIG.maxRange;
		const visual = this.clientVisual;

		// Use task.spawn to run animation independently
		task.spawn(() => {
			const connection = RunService.RenderStepped.Connect((dt) => {
				if (!visual || !visual.Parent) {
					connection.Disconnect();
					return;
				}

				// Move visual
				const movement = velocity.mul(dt);
				visual.Position = visual.Position.add(movement);
				distanceTraveled += movement.Magnitude;

				// Destroy if max range reached
				if (distanceTraveled >= maxRange) {
					connection.Disconnect();
					visual.Destroy();
				}
			});
		});
	}

	public OnEndClient() {
		// Don't destroy the visual here - let it finish its flight
		// The visual will clean itself up when it reaches max range or hits something
		print("[Fireball] OnEndClient called - visual continues independently");
	}

	/**
	 * Create the fireball visual part
	 */
	private createFireballVisual(): BasePart {
		const fireball = new Instance("Part");
		fireball.Name = "FireballVisual";
		fireball.Shape = Enum.PartType.Ball;
		fireball.Size = new Vector3(
			this.CONFIG.radius * 2,
			this.CONFIG.radius * 2,
			this.CONFIG.radius * 2,
		);
		fireball.Material = Enum.Material.Neon;
		fireball.Color = Color3.fromRGB(255, 100, 0); // Orange
		fireball.Anchored = true;
		fireball.CanCollide = false;
		fireball.CastShadow = false;

		// Add point light for glow effect
		const light = new Instance("PointLight");
		light.Color = Color3.fromRGB(255, 150, 50);
		light.Brightness = 2;
		light.Range = 8;
		light.Parent = fireball;

		// Add fire particle effect
		const fire = new Instance("Fire");
		fire.Size = 3;
		fire.Heat = 5;
		fire.Color = Color3.fromRGB(255, 200, 100);
		fire.SecondaryColor = Color3.fromRGB(255, 50, 0);
		fire.Parent = fireball;

		return fireball;
	}
}
