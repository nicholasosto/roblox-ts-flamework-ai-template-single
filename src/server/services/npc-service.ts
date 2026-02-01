import { Service, OnStart } from "@flamework/core";
import { Components } from "@flamework/components";
import { CollectionService, HttpService, Workspace } from "@rbxts/services";
import { createLogger } from "shared/utils/logger";
import { RigsFolder } from "shared/roblox-templates/game-package";
import { getNPCDefinition, NPC_CATALOG } from "shared/npc/npc-catalog";
import { rollLootTable, rollCurrencyDrops } from "shared/npc/npc-loot-tables";
import { NPCDefinition } from "shared/npc/npc-types";
import { NPCSpawnerComponent } from "../components/npc/npc-spawner";
import { WCSService } from "./wcs-service";

const logger = createLogger("NPCService");

/**
 * NPC Service
 * Manages NPC spawning, lifecycle, and cleanup
 * Uses rig templates from the game package
 */
@Service()
export class NPCService implements OnStart {
	// NPC tracking
	private activeNPCs = new Map<string, Model>(); // UUID -> Model
	private npcFolder?: Folder;

	/**
	 * Constructor injection - Flamework automatically injects dependencies
	 * WCSService dependency ensures WCS is initialized before NPCs spawn
	 */
	constructor(
		private readonly components: Components,
		// Injected to ensure WCS initializes before NPC spawning
		_wcsService: WCSService,
	) {}

	onStart() {
		logger.info("NPC Service starting...");

		// Create folder for NPCs in workspace
		this.npcFolder = new Instance("Folder");
		this.npcFolder.Name = "NPCs";
		this.npcFolder.Parent = Workspace;

		// Connect spawner components
		this.setupSpawnerCallbacks();

		// Spawn some test NPCs
		this.spawnTestNPCs();

		logger.info("NPC Service initialized");
	}

	/**
	 * Setup callbacks for spawner components
	 */
	private setupSpawnerCallbacks(): void {
		// Helper to connect a spawner
		const connectSpawner = (component: NPCSpawnerComponent) => {
			component.onSpawnRequested = (defId, position) => this.spawnNPC(defId, position);
			logger.debug(`Connected spawner: ${component.instance.Name}`);
		};

		// Connect spawners that ALREADY exist (loaded before this service started)
		for (const component of this.components.getAllComponents<NPCSpawnerComponent>()) {
			connectSpawner(component);
		}

		// Connect spawners added in the FUTURE
		this.components.onComponentAdded<NPCSpawnerComponent>((component) => {
			connectSpawner(component);
		});
	}

	/**
	 * Spawn test NPCs for development
	 */
	private spawnTestNPCs(): void {
		// Spawn a few NPCs at fixed positions for testing
		// You can remove this in production and use spawners instead

		task.delay(2, () => {
			// Training dummy
			this.spawnNPC("training_dummy", new Vector3(10, 555, 0));

			// A hostile NPC
			this.spawnNPC("decay_zombie", new Vector3(20, 555, 10));

			// Another hostile
			this.spawnNPC("robot_worker", new Vector3(25, 555, -5));
		});
	}

	/**
	 * Spawn an NPC from the catalog
	 */
	public spawnNPC(definitionId: string, position: Vector3): Model | undefined {
		const definition = getNPCDefinition(definitionId);
		if (!definition) {
			logger.warn(`NPC definition not found: ${definitionId}`);
			return undefined;
		}

		// Clone the rig template
		const rigTemplate = RigsFolder.FindFirstChild(definition.rigKey) as Model | undefined;
		if (!rigTemplate) {
			logger.warn(`Rig template not found: ${definition.rigKey}`);
			return undefined;
		}

		const npc = rigTemplate.Clone();
		npc.Name = `${definition.displayName}_${HttpService.GenerateGUID(false).sub(1, 8)}`;

		// Generate UUID for tracking
		const uuid = HttpService.GenerateGUID(false);

		// Set attributes for components
		npc.SetAttribute("npcDefinitionId", definitionId);
		npc.SetAttribute("npcUUID", uuid);
		npc.SetAttribute("spawnX", position.X);
		npc.SetAttribute("spawnY", position.Y);
		npc.SetAttribute("spawnZ", position.Z);

		// Position the NPC
		const rootPart = npc.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (rootPart) {
			npc.PivotTo(new CFrame(position));
		}

		// Parent to workspace
		npc.Parent = this.npcFolder;

		// Add component tags
		CollectionService.AddTag(npc, "npc:Base");

		// Add AI tag if not stationary
		if (definition.aiType !== "stationary") {
			CollectionService.AddTag(npc, "npc:AI");
		}

		// Track the NPC
		this.activeNPCs.set(uuid, npc);

		// Setup death handling
		this.setupDeathHandler(npc, definition, uuid, position);

		logger.info(`Spawned ${definition.displayName} at ${position} (${uuid.sub(1, 8)})`);
		return npc;
	}

	/**
	 * Setup death handling for an NPC
	 */
	private setupDeathHandler(npc: Model, definition: NPCDefinition, uuid: string, spawnPosition: Vector3): void {
		const humanoid = npc.FindFirstChildOfClass("Humanoid");
		if (!humanoid) return;

		humanoid.Died.Once(() => {
			logger.info(`${definition.displayName} died!`);

			// Drop loot
			if (definition.lootTableId) {
				this.dropLoot(npc, definition.lootTableId);
			}

			// Cleanup after delay (give time for death animation)
			task.delay(3, () => {
				this.cleanupNPC(uuid);
			});

			// Schedule respawn
			if (definition.respawnTime > 0) {
				task.delay(definition.respawnTime, () => {
					this.spawnNPC(definition.id, spawnPosition);
				});
			}
		});
	}

	/**
	 * Drop loot from an NPC
	 */
	private dropLoot(npc: Model, lootTableId: string): void {
		const rootPart = npc.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
		if (!rootPart) return;

		// Position could be used for spawning pickup items in the future
		// const dropPosition = rootPart.Position;

		// Roll item drops
		const itemDrops = rollLootTable(lootTableId);
		for (const drop of itemDrops) {
			logger.debug(`Dropped: ${drop.catalogId} x${drop.quantity}`);
			// TODO: Create pickup or add to nearby player's inventory
		}

		// Roll currency drops
		const currencyDrops = rollCurrencyDrops(lootTableId);
		for (const drop of currencyDrops) {
			logger.debug(`Dropped: ${drop.amount} ${drop.currency}`);
			// TODO: Award to player who killed the NPC
		}
	}

	/**
	 * Clean up an NPC
	 */
	private cleanupNPC(uuid: string): void {
		const npc = this.activeNPCs.get(uuid);
		if (!npc) return;

		this.activeNPCs.delete(uuid);

		if (npc.Parent) {
			npc.Destroy();
		}

		logger.debug(`Cleaned up NPC ${uuid.sub(1, 8)}`);
	}

	/**
	 * Get an active NPC by UUID
	 */
	public getNPC(uuid: string): Model | undefined {
		return this.activeNPCs.get(uuid);
	}

	/**
	 * Get all active NPCs
	 */
	public getAllNPCs(): Model[] {
		const npcs: Model[] = [];
		for (const [, npc] of this.activeNPCs) {
			npcs.push(npc);
		}
		return npcs;
	}

	/**
	 * Get active NPC count
	 */
	public getActiveCount(): number {
		return this.activeNPCs.size();
	}

	/**
	 * Despawn all NPCs
	 */
	public despawnAll(): void {
		for (const [uuid] of this.activeNPCs) {
			this.cleanupNPC(uuid);
		}
		logger.info("Despawned all NPCs");
	}

	/**
	 * Spawn NPCs by tier (useful for events/waves)
	 */
	public spawnWave(tier: NPCDefinition["tier"], count: number, center: Vector3, radius: number): void {
		const eligibleNPCs: string[] = [];
		for (const [id, def] of pairs(NPC_CATALOG)) {
			if (def.tier === tier && def.aiType !== "stationary") {
				eligibleNPCs.push(id);
			}
		}

		if (eligibleNPCs.size() === 0) {
			logger.warn(`No NPCs found for tier: ${tier}`);
			return;
		}

		for (let i = 0; i < count; i++) {
			const defId = eligibleNPCs[math.random(0, eligibleNPCs.size() - 1)];
			const angle = math.random() * math.pi * 2;
			const distance = math.random() * radius;
			const offset = new Vector3(math.cos(angle) * distance, 0, math.sin(angle) * distance);
			const position = center.add(offset);

			this.spawnNPC(defId, position);
		}

		logger.info(`Spawned wave of ${count} ${tier} NPCs`);
	}
}
