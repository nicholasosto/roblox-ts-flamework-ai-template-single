import { Skill, SkillDecorator, Character } from "@rbxts/wcs";
import { RunService, Workspace } from "@rbxts/services";
import { Poisoned } from "../status-effects/poisoned";
import { getCharacterLookDirection } from "../utils/raycast-utils";

/**
 * Lake of Decay Configuration
 */
interface LakeConfig {
	/** Radius of the poison lake */
	radius: number;
	/** Duration the lake persists (seconds) */
	duration: number;
	/** How long poison lasts on affected characters */
	poisonDuration: number;
	/** How often to check for characters in the lake */
	tickRate: number;
	/** Initial damage when lake is created (optional) */
	initialDamage: number;
}

/**
 * Lake of Decay Skill
 *
 * Creates a poison lake on the ground in front of the caster.
 * Characters standing in the lake receive the Poisoned status effect.
 * The lake persists for a duration before dissipating.
 */
@SkillDecorator
export class LakeOfDecay extends Skill {
	// ===== CONFIGURATION =====
	private readonly CONFIG: LakeConfig = {
		radius: 12, // Studs
		duration: 8, // Seconds the lake exists
		poisonDuration: 6, // Seconds poison lasts after leaving
		tickRate: 0.5, // Check every half second
		initialDamage: 10, // Damage on lake creation
	};

	private readonly COOLDOWN = 12; // Seconds
	private readonly SPAWN_DISTANCE = 15; // How far in front to spawn

	// Server state
	private lakePart?: Part;
	private tickConnection?: RBXScriptConnection;
	private affectedCharacters = new Set<Character>();

	// Client state
	private clientVisual?: Part;
	private clientParticles?: ParticleEmitter;

	public OnConstruct() {
		this.MutualExclusives = [];
	}

	// ===== SERVER =====

	public OnStartServer() {
		const characterModel = this.Character.Instance as Model;
		const rootPart = characterModel.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

		if (!rootPart) {
			warn("[LakeOfDecay] No HumanoidRootPart found");
			return;
		}

		// Get look direction (horizontal only)
		const direction = getCharacterLookDirection(characterModel);
		if (!direction) {
			warn("[LakeOfDecay] Could not get look direction");
			return;
		}

		// Calculate spawn position on the ground
		const spawnPosition = this.calculateGroundPosition(rootPart.Position, direction);

		if (!spawnPosition) {
			warn("[LakeOfDecay] Could not find ground position");
			return;
		}

		// Create the poison lake
		this.createLake(spawnPosition);

		// Start damage tick
		this.startPoisonTick();

		// Apply cooldown
		this.ApplyCooldown(this.COOLDOWN);

		// Schedule lake destruction
		task.delay(this.CONFIG.duration, () => {
			this.destroyLake();
		});

		print(`[LakeOfDecay] Created poison lake at ${spawnPosition}`);
	}

	public OnEndServer() {
		this.destroyLake();
	}

	/**
	 * Raycast to find ground position
	 */
	private calculateGroundPosition(origin: Vector3, direction: Vector3): Vector3 | undefined {
		// Calculate target position in front of caster
		const horizontalDir = new Vector3(direction.X, 0, direction.Z).Unit;
		const targetPosition = origin.add(horizontalDir.mul(this.SPAWN_DISTANCE));

		// Raycast down to find ground
		const rayOrigin = new Vector3(targetPosition.X, origin.Y + 10, targetPosition.Z);
		const rayDirection = new Vector3(0, -50, 0);

		const raycastParams = new RaycastParams();
		raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
		raycastParams.FilterDescendantsInstances = [this.Character.Instance];

		const result = Workspace.Raycast(rayOrigin, rayDirection, raycastParams);

		if (result) {
			// Slightly above ground
			return result.Position.add(new Vector3(0, 0.1, 0));
		}

		// Fallback: use target position at caster's Y level
		return new Vector3(targetPosition.X, origin.Y - 2, targetPosition.Z);
	}

	/**
	 * Create the poison lake part (server)
	 */
	private createLake(position: Vector3): void {
		this.lakePart = new Instance("Part");
		this.lakePart.Name = "LakeOfDecay";
		this.lakePart.Shape = Enum.PartType.Cylinder;

		// Size: Cylinder is oriented along Y axis, so X = height, Y = diameter, Z = diameter
		this.lakePart.Size = new Vector3(0.5, this.CONFIG.radius * 2, this.CONFIG.radius * 2);

		// Rotate to lay flat on ground (cylinder default is standing up)
		this.lakePart.CFrame = new CFrame(position).mul(CFrame.Angles(0, 0, math.rad(90)));

		// Visual properties
		this.lakePart.Color = Color3.fromRGB(80, 150, 80); // Murky green
		this.lakePart.Material = Enum.Material.Neon;
		this.lakePart.Transparency = 0.4;

		// Physics properties
		this.lakePart.Anchored = true;
		this.lakePart.CanCollide = false;
		this.lakePart.CanTouch = true;
		this.lakePart.CastShadow = false;

		this.lakePart.Parent = Workspace;
	}

	/**
	 * Start the poison tick loop
	 */
	private startPoisonTick(): void {
		let elapsed = 0;

		this.tickConnection = RunService.Heartbeat.Connect((dt) => {
			if (!this.lakePart) return;

			elapsed += dt;
			if (elapsed < this.CONFIG.tickRate) return;
			elapsed = 0;

			// Find characters in lake
			const lakePosition = this.lakePart.Position;
			const radiusSquared = this.CONFIG.radius * this.CONFIG.radius;

			const characterMap = Character.GetCharacterMap();

			for (const [, wcsChar] of characterMap) {
				// Skip caster
				if (wcsChar === this.Character) continue;

				const rootPart = wcsChar.Instance.FindFirstChild("HumanoidRootPart") as
					| BasePart
					| undefined;
				if (!rootPart) continue;

				// Check if within lake radius (horizontal distance only)
				const charPos = rootPart.Position;
				const dx = charPos.X - lakePosition.X;
				const dz = charPos.Z - lakePosition.Z;
				const distSquared = dx * dx + dz * dz;

				// Also check Y to ensure they're on the ground near the lake
				const yDiff = math.abs(charPos.Y - lakePosition.Y);

				if (distSquared <= radiusSquared && yDiff < 5) {
					this.applyPoisonToCharacter(wcsChar);
				}
			}
		});
	}

	/**
	 * Apply poison to a character
	 */
	private applyPoisonToCharacter(character: Character): void {
		// Track first contact for initial damage
		const isFirstContact = !this.affectedCharacters.has(character);

		if (isFirstContact) {
			this.affectedCharacters.add(character);

			// Deal initial damage
			if (this.CONFIG.initialDamage > 0) {
				const damageContainer = this.CreateDamageContainer(this.CONFIG.initialDamage);
				character.TakeDamage(damageContainer);
			}
		}

		// Apply/refresh poison using the static helper
		Poisoned.applyTo(character, this.CONFIG.poisonDuration);
	}

	/**
	 * Destroy the lake and cleanup
	 */
	private destroyLake(): void {
		this.tickConnection?.Disconnect();
		this.tickConnection = undefined;

		if (this.lakePart) {
			this.lakePart.Destroy();
			this.lakePart = undefined;
		}

		this.affectedCharacters.clear();
	}

	// ===== CLIENT =====

	public OnStartClient() {
		const characterModel = this.Character.Instance as Model;
		const rootPart = characterModel.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

		if (!rootPart) return;

		// Get direction and calculate position
		const direction = getCharacterLookDirection(characterModel);
		if (!direction) return;

		// Match server position calculation
		const horizontalDir = new Vector3(direction.X, 0, direction.Z).Unit;
		const targetPosition = rootPart.Position.add(horizontalDir.mul(this.SPAWN_DISTANCE));

		// Create visual lake
		this.createClientVisual(
			new Vector3(targetPosition.X, rootPart.Position.Y - 2, targetPosition.Z),
		);

		// Schedule destruction
		task.delay(this.CONFIG.duration, () => {
			this.destroyClientVisual();
		});
	}

	public OnEndClient() {
		this.destroyClientVisual();
	}

	/**
	 * Create client-side visual effects
	 */
	private createClientVisual(position: Vector3): void {
		// Create visual part
		this.clientVisual = new Instance("Part");
		this.clientVisual.Name = "LakeOfDecay_Visual";
		this.clientVisual.Shape = Enum.PartType.Cylinder;
		this.clientVisual.Size = new Vector3(0.5, this.CONFIG.radius * 2, this.CONFIG.radius * 2);
		this.clientVisual.CFrame = new CFrame(position).mul(CFrame.Angles(0, 0, math.rad(90)));
		this.clientVisual.Color = Color3.fromRGB(80, 150, 80);
		this.clientVisual.Material = Enum.Material.Neon;
		this.clientVisual.Transparency = 0.4;
		this.clientVisual.Anchored = true;
		this.clientVisual.CanCollide = false;
		this.clientVisual.CanQuery = false;
		this.clientVisual.CastShadow = false;
		this.clientVisual.Parent = Workspace;

		// Add particle effect
		const attachment = new Instance("Attachment");
		attachment.Parent = this.clientVisual;

		this.clientParticles = new Instance("ParticleEmitter");
		this.clientParticles.Color = new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(100, 200, 100)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(50, 100, 50)),
		]);
		this.clientParticles.Size = new NumberSequence([
			new NumberSequenceKeypoint(0, 0.5),
			new NumberSequenceKeypoint(0.5, 1),
			new NumberSequenceKeypoint(1, 0),
		]);
		this.clientParticles.Transparency = new NumberSequence([
			new NumberSequenceKeypoint(0, 0.5),
			new NumberSequenceKeypoint(1, 1),
		]);
		this.clientParticles.Rate = 30;
		this.clientParticles.Lifetime = new NumberRange(1, 2);
		this.clientParticles.Speed = new NumberRange(2, 5);
		this.clientParticles.SpreadAngle = new Vector2(180, 180);
		this.clientParticles.EmissionDirection = Enum.NormalId.Top;
		this.clientParticles.LightEmission = 0.2;
		this.clientParticles.Parent = attachment;

		// Add point light for eerie glow
		const light = new Instance("PointLight");
		light.Color = Color3.fromRGB(100, 200, 100);
		light.Brightness = 1;
		light.Range = this.CONFIG.radius;
		light.Parent = this.clientVisual;

		print("[LakeOfDecay] Client visual created");
	}

	/**
	 * Destroy client visual effects
	 */
	private destroyClientVisual(): void {
		if (this.clientVisual) {
			// Fade out particles first
			if (this.clientParticles) {
				this.clientParticles.Enabled = false;
			}

			// Delay destruction to let particles fade
			const visual = this.clientVisual;
			task.delay(2, () => {
				visual.Destroy();
			});

			this.clientVisual = undefined;
			this.clientParticles = undefined;
		}
	}
}
