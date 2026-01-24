import { Skill, SkillDecorator } from "@rbxts/wcs";

@SkillDecorator
export class MySkill extends Skill {
	// Override OnConstruct to run setup logic on both client and server
	public OnConstruct() {
		// Common initialization
	}

	// Override OnConstructServer for server-only initialization
	public OnConstructServer() {
		// Server-specific initialization
	}

	// Override OnConstructClient for client-only initialization
	public OnConstructClient() {
		// Client-specific initialization
	}

	// Override ShouldStart to add conditions for skill activation
	public ShouldStart() {
		// Return false to prevent skill from starting
		return true;
	}

	// Override OnStartServer for server-side skill logic
	public OnStartServer(params?: any) {
		print("Skill started on server!");

		// Apply cooldown (in seconds)
		this.ApplyCooldown(5);

		// The skill will automatically end when this function completes
		// Use task.wait() or promises to extend the skill duration
	}

	// Override OnStartClient for client-side visual effects
	public OnStartClient(params?: any) {
		print("Skill started on client!");
		// Play animations, visual effects, sounds, etc.
	}

	// Override OnEndServer for cleanup when skill ends on server
	public OnEndServer() {
		// Server-side cleanup
	}

	// Override OnEndClient for cleanup when skill ends on client
	public OnEndClient() {
		// Client-side cleanup
	}
}
