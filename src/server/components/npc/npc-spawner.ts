import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { createLogger } from "shared/utils";

const log = createLogger("component:NPCSpawner");

/**
 * Spawner Attributes
 */
interface SpawnerAttributes {
	/** NPC definition ID to spawn */
	npcDefinitionId: string;
	/** Maximum NPCs this spawner can have active */
	maxCount?: number;
	/** Time between spawns when below max */
	spawnInterval?: number;
	/** Initial delay before first spawn */
	initialDelay?: number;
	/** Whether spawner is enabled */
	enabled?: boolean;
	/** Spawn radius (random offset from spawner position) */
	spawnRadius?: number;
}

/**
 * NPC Spawner Component
 * Place in world to spawn NPCs at that location
 *
 * Tag: "npc:Spawner"
 * Attach to a Part in the workspace
 *
 * Attributes:
 *   - npcDefinitionId: string (required) - Which NPC to spawn
 *   - maxCount: number (default: 1) - Max active NPCs
 *   - spawnInterval: number (default: 30) - Seconds between spawns
 *   - initialDelay: number (default: 0) - Delay before first spawn
 *   - enabled: boolean (default: true) - Whether spawner is active
 *   - spawnRadius: number (default: 0) - Random spawn offset
 */
@Component({ tag: "npc:Spawner" })
export class NPCSpawnerComponent extends BaseComponent<SpawnerAttributes, BasePart> implements OnStart {
	// Track spawned NPCs
	private spawnedNPCs: Model[] = [];
	private isSpawning = false;

	// Callbacks (set by NPCService)
	public onSpawnRequested?: (definitionId: string, position: Vector3) => Model | undefined;

	onStart(): void {
		log.info(`Initializing NPC Spawner: ${this.instance.Name}`);
		const defId = this.attributes.npcDefinitionId;
		if (!defId) {
			log.warn(`Spawner ${this.instance.Name} missing npcDefinitionId attribute`);
			return;
		}

		const enabled = this.attributes.enabled ?? true;
		if (!enabled) {
			log.debug(`Spawner ${this.instance.Name} is disabled`);
			return;
		}

		log.info(`Spawner initialized: ${this.instance.Name} → ${defId}`);

		// Start spawn loop
		const initialDelay = this.attributes.initialDelay ?? 0;
		task.delay(initialDelay, () => this.startSpawnLoop());
	}

	/**
	 * Start the spawn loop
	 */
	private startSpawnLoop(): void {
		// Initial spawn
		this.trySpawn();

		// Continuous spawn loop
		const interval = this.attributes.spawnInterval ?? 30;

		task.spawn(() => {
			while (this.instance && this.instance.Parent) {
				task.wait(interval);
				this.cleanupDeadNPCs();
				this.trySpawn();
			}
		});
	}

	/**
	 * Try to spawn an NPC if below max count
	 */
	private trySpawn(): void {
		if (this.isSpawning) return;

		const maxCount = this.attributes.maxCount ?? 1;
		const enabled = this.attributes.enabled ?? true;

		if (!enabled) return;
		if (this.spawnedNPCs.size() >= maxCount) return;
		if (!this.onSpawnRequested) {
			log.warn(`Spawner ${this.instance.Name}: No spawn callback set`);
			return;
		}

		this.isSpawning = true;

		// Calculate spawn position
		const position = this.getSpawnPosition();
		const defId = this.attributes.npcDefinitionId;

		// Request spawn from NPCService
		const npc = this.onSpawnRequested(defId, position);

		if (npc) {
			this.spawnedNPCs.push(npc);
			log.debug(`Spawner ${this.instance.Name} spawned ${defId} (${this.spawnedNPCs.size()}/${maxCount})`);

			// Track NPC destruction
			npc.Destroying.Once(() => {
				const index = this.spawnedNPCs.indexOf(npc);
				if (index !== -1) {
					this.spawnedNPCs.remove(index);
				}
			});
		}

		this.isSpawning = false;
	}

	/**
	 * Get spawn position with optional random offset
	 */
	private getSpawnPosition(): Vector3 {
		const basePosition = this.instance.Position;
		const radius = this.attributes.spawnRadius ?? 0;

		if (radius <= 0) {
			return basePosition;
		}

		// Random offset within radius
		const angle = math.random() * math.pi * 2;
		const distance = math.random() * radius;
		const offset = new Vector3(math.cos(angle) * distance, 0, math.sin(angle) * distance);

		return basePosition.add(offset);
	}

	/**
	 * Remove destroyed NPCs from tracking
	 */
	private cleanupDeadNPCs(): void {
		this.spawnedNPCs = this.spawnedNPCs.filter((npc) => npc && npc.Parent !== undefined);
	}

	/**
	 * Get current active NPC count
	 */
	public getActiveCount(): number {
		this.cleanupDeadNPCs();
		return this.spawnedNPCs.size();
	}

	/**
	 * Force spawn (ignores max count)
	 */
	public forceSpawn(): Model | undefined {
		if (!this.onSpawnRequested) return undefined;

		const position = this.getSpawnPosition();
		const defId = this.attributes.npcDefinitionId;
		const npc = this.onSpawnRequested(defId, position);

		if (npc) {
			this.spawnedNPCs.push(npc);
		}

		return npc;
	}

	/**
	 * Kill all spawned NPCs
	 */
	public killAll(): void {
		for (const npc of this.spawnedNPCs) {
			const humanoid = npc.FindFirstChildOfClass("Humanoid");
			if (humanoid) {
				humanoid.Health = 0;
			}
		}
	}

	destroy(): void {
		// NPCs will be cleaned up naturally
	}
}
