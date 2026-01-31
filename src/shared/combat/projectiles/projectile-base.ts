import { RunService, Workspace } from "@rbxts/services";
import { projectileRaycast, ProjectileHitResult } from "../utils/raycast-utils";

/**
 * Configuration for projectile behavior
 */
export interface ProjectileConfig {
	speed: number; // Studs per second
	maxRange: number; // Maximum travel distance
	damage: number; // Damage on hit
	gravity: number; // Gravity multiplier (0 = no gravity)
	pierce: number; // Number of targets to pierce (0 = stop on first)
	radius: number; // Visual/collision radius
}

/**
 * Base class for server-authoritative projectiles
 * Uses stepped raycasting for hit detection
 */
export class ProjectileBase {
	// State
	private active = false;
	private distanceTraveled = 0;
	private pierceCount = 0;
	private hitTargets = new Set<Model>();

	// Position tracking
	private currentPosition: Vector3;
	private velocity: Vector3;

	// Connections
	private heartbeatConnection?: RBXScriptConnection;

	// Callbacks
	public onHit?: (result: ProjectileHitResult) => void;
	public onDestroy?: (position: Vector3) => void;
	public onPositionUpdate?: (position: Vector3, velocity: Vector3) => void;

	constructor(
		private readonly config: ProjectileConfig,
		_origin: Vector3,
		_direction: Vector3,
		private readonly filterInstances: Instance[],
	) {
		this.currentPosition = _origin;
		this.velocity = _direction.Unit.mul(config.speed);
	}

	/**
	 * Start the projectile simulation
	 */
	public start(): void {
		if (this.active) return;
		this.active = true;

		this.heartbeatConnection = RunService.Heartbeat.Connect((dt) => this.update(dt));
	}

	/**
	 * Stop and cleanup the projectile
	 */
	public destroy(): void {
		if (!this.active) return;
		this.active = false;

		this.heartbeatConnection?.Disconnect();
		this.heartbeatConnection = undefined;

		this.onDestroy?.(this.currentPosition);
	}

	/**
	 * Check if projectile is still active
	 */
	public isActive(): boolean {
		return this.active;
	}

	/**
	 * Get current position
	 */
	public getPosition(): Vector3 {
		return this.currentPosition;
	}

	/**
	 * Update projectile position and check for hits
	 */
	private update(deltaTime: number): void {
		if (!this.active) return;

		// Apply gravity to velocity
		if (this.config.gravity > 0) {
			const gravityForce = new Vector3(0, -Workspace.Gravity * this.config.gravity * deltaTime, 0);
			this.velocity = this.velocity.add(gravityForce);
		}

		// Calculate movement this frame
		const movement = this.velocity.mul(deltaTime);
		const movementMagnitude = movement.Magnitude;

		// Raycast for hit detection
		const hitResult = projectileRaycast({
			origin: this.currentPosition,
			direction: movement,
			filterInstances: this.filterInstances,
		});

		if (hitResult.hit && hitResult.distance <= movementMagnitude) {
			// Hit something!
			this.currentPosition = hitResult.position;
			this.distanceTraveled += hitResult.distance;

			// Check if it's a new target (for pierce)
			const isNewTarget = hitResult.character && !this.hitTargets.has(hitResult.character);

			if (hitResult.character && isNewTarget) {
				this.hitTargets.add(hitResult.character);
				this.pierceCount++;

				// Fire hit callback
				this.onHit?.(hitResult);

				// Check pierce limit (pierce: 0 = stop on first hit)
				if (this.pierceCount > this.config.pierce) {
					this.destroy();
					return;
				}

				// Add hit character to filter for future raycasts
				this.filterInstances.push(hitResult.character);
			} else if (!hitResult.character) {
				// Hit terrain/static object - stop
				this.onHit?.(hitResult);
				this.destroy();
				return;
			}
		} else {
			// No hit - continue moving
			this.currentPosition = this.currentPosition.add(movement);
			this.distanceTraveled += movementMagnitude;
		}

		// Check max range
		if (this.distanceTraveled >= this.config.maxRange) {
			this.destroy();
			return;
		}

		// Notify position update
		this.onPositionUpdate?.(this.currentPosition, this.velocity);
	}
}
