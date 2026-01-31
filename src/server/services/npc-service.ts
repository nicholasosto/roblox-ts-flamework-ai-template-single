import { Service, OnStart } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { Character, DamageContainer } from "@rbxts/wcs";
import { createLogger } from "shared/utils/logger";

const logger = createLogger("NPCService");

/**
 * Simple NPC Service for testing combat skills
 * Spawns target dummies that can receive WCS damage
 */
@Service()
export class NPCService implements OnStart {
	private npcs = new Map<Model, Character>();
	private npcFolder?: Folder;

	onStart() {
		logger.info("NPC Service starting...");

		// Create folder for NPCs
		this.npcFolder = new Instance("Folder");
		this.npcFolder.Name = "NPCs";
		this.npcFolder.Parent = Workspace;

		// Spawn some test dummies
		this.spawnTestDummy(new Vector3(10, 565, 0), "TestDummy1");
		this.spawnTestDummy(new Vector3(15, 535, 5), "TestDummy2");
		this.spawnTestDummy(new Vector3(20, 605, -5), "TestDummy3");

		logger.info("NPC Service initialized - spawned 3 test dummies");
	}

	/**
	 * Spawn a test dummy at the given position
	 */
	public spawnTestDummy(position: Vector3, name: string): Model | undefined {
		const dummy = this.createDummyModel(name);
		if (!dummy) {
			logger.warn(`Failed to create dummy: ${name}`);
			return undefined;
		}

		// Position the dummy
		const rootPart = dummy.FindFirstChild("HumanoidRootPart") as BasePart;
		if (rootPart) {
			rootPart.CFrame = new CFrame(position);
		}

		// Parent to workspace
		dummy.Parent = this.npcFolder;

		// Create WCS Character wrapper (required for TakeDamage to work)
		const wcsCharacter = new Character(dummy);
		this.npcs.set(dummy, wcsCharacter);

		// Listen for damage
		wcsCharacter.DamageTaken.Connect((damageContainer: DamageContainer) => {
			this.onDummyDamaged(dummy, damageContainer);
		});

		// Handle humanoid death
		const humanoid = dummy.FindFirstChild("Humanoid") as Humanoid;
		if (humanoid) {
			humanoid.Died.Once(() => {
				logger.info(`${name} died! Respawning in 5 seconds...`);
				this.cleanupNPC(dummy);

				// Respawn after delay
				task.delay(5, () => {
					this.spawnTestDummy(position, name);
				});
			});
		}

		logger.info(`Spawned ${name} at ${position}`);
		return dummy;
	}

	/**
	 * Handle damage taken by a dummy
	 */
	private onDummyDamaged(dummy: Model, damageContainer: DamageContainer): void {
		const humanoid = dummy.FindFirstChild("Humanoid") as Humanoid;
		if (!humanoid) return;

		// Apply damage to humanoid health
		humanoid.TakeDamage(damageContainer.Damage);

		logger.info(`${dummy.Name} took ${damageContainer.Damage} damage! Health: ${humanoid.Health}/${humanoid.MaxHealth}`);

		// Visual feedback - flash red
		this.flashDummy(dummy);
	}

	/**
	 * Flash the dummy red to indicate damage
	 */
	private flashDummy(dummy: Model): void {
		const torso = dummy.FindFirstChild("Torso") as BasePart;
		if (!torso) return;

		const originalColor = torso.Color;
		torso.Color = Color3.fromRGB(255, 0, 0);

		task.delay(0.1, () => {
			if (torso && torso.Parent) {
				torso.Color = originalColor;
			}
		});
	}

	/**
	 * Clean up an NPC
	 */
	private cleanupNPC(dummy: Model): void {
		const wcsCharacter = this.npcs.get(dummy);
		if (wcsCharacter) {
			wcsCharacter.Destroy();
			this.npcs.delete(dummy);
		}
		dummy.Destroy();
	}

	/**
	 * Create a simple R6 dummy model
	 */
	private createDummyModel(name: string): Model | undefined {
		const model = new Instance("Model");
		model.Name = name;

		// Create Humanoid
		const humanoid = new Instance("Humanoid");
		humanoid.MaxHealth = 100;
		humanoid.Health = 100;
		humanoid.Parent = model;

		// Create body parts (R6 style)
		const torso = this.createPart("Torso", new Vector3(2, 2, 1), Color3.fromRGB(163, 162, 165));
		torso.Parent = model;
		model.PrimaryPart = torso;

		const head = this.createPart("Head", new Vector3(1.25, 1.25, 1.25), Color3.fromRGB(245, 205, 168));
		head.Parent = model;

		// Add face
		const face = new Instance("Decal");
		face.Name = "face";
		face.Face = Enum.NormalId.Front;
		face.Texture = "rbxasset://textures/face.png";
		face.Parent = head;

		const leftArm = this.createPart("Left Arm", new Vector3(1, 2, 1), Color3.fromRGB(245, 205, 168));
		leftArm.Parent = model;

		const rightArm = this.createPart("Right Arm", new Vector3(1, 2, 1), Color3.fromRGB(245, 205, 168));
		rightArm.Parent = model;

		const leftLeg = this.createPart("Left Leg", new Vector3(1, 2, 1), Color3.fromRGB(13, 105, 172));
		leftLeg.Parent = model;

		const rightLeg = this.createPart("Right Leg", new Vector3(1, 2, 1), Color3.fromRGB(13, 105, 172));
		rightLeg.Parent = model;

		// Create HumanoidRootPart (required for WCS and character detection)
		const rootPart = this.createPart("HumanoidRootPart", new Vector3(2, 2, 1), Color3.fromRGB(163, 162, 165));
		rootPart.Transparency = 1;
		rootPart.Parent = model;

		// Position parts relative to root
		this.positionR6Parts(rootPart, head, torso, leftArm, rightArm, leftLeg, rightLeg);

		// Create Motor6D joints
		this.createR6Joints(rootPart, head, torso, leftArm, rightArm, leftLeg, rightLeg);

		return model;
	}

	private createPart(name: string, size: Vector3, color: Color3): BasePart {
		const part = new Instance("Part");
		part.Name = name;
		part.Size = size;
		part.Color = color;
		part.Anchored = false;
		part.CanCollide = true;
		return part;
	}

	private positionR6Parts(
		root: BasePart,
		head: BasePart,
		torso: BasePart,
		leftArm: BasePart,
		rightArm: BasePart,
		leftLeg: BasePart,
		rightLeg: BasePart,
	): void {
		// Position relative to root (which is at center of torso)
		torso.CFrame = root.CFrame;
		head.CFrame = root.CFrame.mul(new CFrame(0, 1.625, 0));
		leftArm.CFrame = root.CFrame.mul(new CFrame(-1.5, 0, 0));
		rightArm.CFrame = root.CFrame.mul(new CFrame(1.5, 0, 0));
		leftLeg.CFrame = root.CFrame.mul(new CFrame(-0.5, -2, 0));
		rightLeg.CFrame = root.CFrame.mul(new CFrame(0.5, -2, 0));
	}

	private createR6Joints(
		root: BasePart,
		head: BasePart,
		torso: BasePart,
		leftArm: BasePart,
		rightArm: BasePart,
		leftLeg: BasePart,
		rightLeg: BasePart,
	): void {
		// Root -> Torso
		const rootJoint = new Instance("Motor6D");
		rootJoint.Name = "RootJoint";
		rootJoint.Part0 = root;
		rootJoint.Part1 = torso;
		rootJoint.C0 = new CFrame();
		rootJoint.C1 = new CFrame();
		rootJoint.Parent = root;

		// Torso -> Head (Neck)
		const neck = new Instance("Motor6D");
		neck.Name = "Neck";
		neck.Part0 = torso;
		neck.Part1 = head;
		neck.C0 = new CFrame(0, 1, 0);
		neck.C1 = new CFrame(0, -0.5, 0);
		neck.Parent = torso;

		// Torso -> Left Arm
		const leftShoulder = new Instance("Motor6D");
		leftShoulder.Name = "Left Shoulder";
		leftShoulder.Part0 = torso;
		leftShoulder.Part1 = leftArm;
		leftShoulder.C0 = new CFrame(-1, 0.5, 0);
		leftShoulder.C1 = new CFrame(0.5, 0.5, 0);
		leftShoulder.Parent = torso;

		// Torso -> Right Arm
		const rightShoulder = new Instance("Motor6D");
		rightShoulder.Name = "Right Shoulder";
		rightShoulder.Part0 = torso;
		rightShoulder.Part1 = rightArm;
		rightShoulder.C0 = new CFrame(1, 0.5, 0);
		rightShoulder.C1 = new CFrame(-0.5, 0.5, 0);
		rightShoulder.Parent = torso;

		// Torso -> Left Leg
		const leftHip = new Instance("Motor6D");
		leftHip.Name = "Left Hip";
		leftHip.Part0 = torso;
		leftHip.Part1 = leftLeg;
		leftHip.C0 = new CFrame(-0.5, -1, 0);
		leftHip.C1 = new CFrame(0, 1, 0);
		leftHip.Parent = torso;

		// Torso -> Right Leg
		const rightHip = new Instance("Motor6D");
		rightHip.Name = "Right Hip";
		rightHip.Part0 = torso;
		rightHip.Part1 = rightLeg;
		rightHip.C0 = new CFrame(0.5, -1, 0);
		rightHip.C1 = new CFrame(0, 1, 0);
		rightHip.Parent = torso;
	}
}
