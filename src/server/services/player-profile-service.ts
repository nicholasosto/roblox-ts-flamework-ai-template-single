import { OnStart, Service } from "@flamework/core";
import ProfileStore, { Profile } from "@rbxts/profile-store";
import { Players } from "@rbxts/services";
import Signal from "@rbxts/signal";
import { defaultPlayerProfileTemplate, PlayerProfileTemplate } from "shared/data";
import { createLogger } from "shared/utils";

const log = createLogger("service:PlayerProfile");
/* Player Profile Type */
const playerDataStore = ProfileStore.New<PlayerProfileTemplate>(
	"Soul-Steel-Test-Profiles",
	defaultPlayerProfileTemplate,
);

/**
 * PlayerProfileService
 *
 * Manages persistent player data using ProfileService.
 * Provides a minimal, clean interface for loading and accessing player profiles
 * based on the canonical shape architecture.
 *
 * Features:
 * - Automatic profile loading on player join
 * - Session locking to prevent data conflicts
 * - Proper cleanup on player leave
 * - Type-safe profile access
 */
@Service({})
export class PlayerProfileService implements OnStart {
	// ProfileService store for player data
	// Active player profiles
	private readonly activeProfiles = new Map<Player, Profile<PlayerProfileTemplate>>();

	// Signal fired when a profile is successfully loaded
	public readonly profileLoaded = new Signal<
		(player: Player, profile: Profile<PlayerProfileTemplate>) => void
	>();
	public readonly profileReleased = new Signal<(player: Player) => void>();
	public readonly profileUpdated = new Signal<(player: Player) => void>();

	constructor() {}
	// Lifecycle
	onStart(): void {
		Players.PlayerAdded.Connect((player) => this.loadPlayerProfile(player));
		Players.PlayerRemoving.Connect((player) => this.releasePlayerProfile(player));
	}

	// Get Profile
	getProfile(player: Player): Profile<PlayerProfileTemplate> | undefined {
		if (!this.activeProfiles.has(player)) {
			log.warn(`Profile for player ${player.Name} is not loaded`);
			return undefined;
		}
		return this.activeProfiles.get(player);
	}
	// Release Profile
	private releasePlayerProfile(player: Player) {
		const profile = this.activeProfiles.get(player);
		if (profile) {
			profile.EndSession();
			this.activeProfiles.delete(player);
			log.info(`Profile session ended for player ${player.Name}`);
		}
	}

	// Load profile when player joins
	private loadPlayerProfile(player: Player) {
		/* Load or create the player's profile */
		const userId = `Player_${player.UserId}`;
		const profile = playerDataStore.StartSessionAsync(userId, {
			Cancel: () => !player.IsDescendantOf(Players),
		});
		// Handle profile loading failure
		if (!profile) {
			log.error(`Failed to load profile for ${player.Name} - kicking player`);
			player.Kick("Failed to load player data. Please try again.");
			return;
		}

		// Handle session lock (player joined from another server)
		profile.AddUserId(player.UserId);
		profile.Reconcile();

		// Listen for profile release
		profile.OnSessionEnd.Connect(() => {
			this.activeProfiles.delete(player);
			player.Kick("Profile session released");
			log.info(`Profile released for player ${player.Name}`);
		});

		// Check if player left during profile load
		if (!player.IsDescendantOf(Players)) {
			profile.EndSession();
			return;
		}

		// Store active profile and fire loaded signal
		this.activeProfiles.set(player, profile);
		log.info(`Profile loaded for player ${player.Name}`, profile.Data);

		// Notify other services that profile is ready
		this.profileLoaded.Fire(player, profile);
	}
}
