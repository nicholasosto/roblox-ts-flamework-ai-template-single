import { Workspace } from "@rbxts/services";

/**
 * Raycast parameters for projectile hit detection
 */
export interface ProjectileRaycastParams {
	origin: Vector3;
	direction: Vector3;
	filterInstances: Instance[];
	filterType?: Enum.RaycastFilterType;
}

/**
 * Result from a projectile raycast
 */
export interface ProjectileHitResult {
	hit: boolean;
	instance?: BasePart;
	position: Vector3;
	normal?: Vector3;
	distance: number;
	humanoid?: Humanoid;
	character?: Model;
}

/**
 * Perform a raycast for projectile hit detection
 */
export function projectileRaycast(params: ProjectileRaycastParams): ProjectileHitResult {
	const raycastParams = new RaycastParams();
	raycastParams.FilterDescendantsInstances = params.filterInstances;
	raycastParams.FilterType = params.filterType ?? Enum.RaycastFilterType.Exclude;
	raycastParams.IgnoreWater = true;

	const result = Workspace.Raycast(params.origin, params.direction, raycastParams);

	if (result) {
		// Try to find humanoid/character from hit part
		const character = result.Instance.FindFirstAncestorOfClass("Model");
		const humanoid = character?.FindFirstChildOfClass("Humanoid");

		return {
			hit: true,
			instance: result.Instance,
			position: result.Position,
			normal: result.Normal,
			distance: result.Distance,
			humanoid: humanoid,
			character: humanoid ? character : undefined,
		};
	}

	// No hit - return end position
	const endPosition = params.origin.add(params.direction);
	return {
		hit: false,
		position: endPosition,
		distance: params.direction.Magnitude,
	};
}

/**
 * Get the look direction from a character's HumanoidRootPart
 */
export function getCharacterLookDirection(characterModel: Model): Vector3 | undefined {
	const rootPart = characterModel.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (!rootPart) return undefined;
	return rootPart.CFrame.LookVector;
}

/**
 * Get all descendants of a character model (for raycast filtering)
 */
export function getCharacterDescendants(characterModel: Model): Instance[] {
	return [characterModel, ...characterModel.GetDescendants()];
}
