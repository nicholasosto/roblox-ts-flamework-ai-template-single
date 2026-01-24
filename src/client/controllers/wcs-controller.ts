import { Controller, OnStart } from "@flamework/core";
import { Players, ReplicatedStorage, UserInputService } from "@rbxts/services";
import { Character, CreateClient } from "@rbxts/wcs";
import { MeleeAttack, Fireball } from "shared/combat/skills";

// Create WCS Client instance
const wcsClient = CreateClient();

/**
 * WCS Combat Controller
 * Handles client-side WCS initialization and input handling
 */
@Controller()
export class WCSController implements OnStart {
	private localCharacter?: Character;

	onStart() {
		print("[WCSController] Starting...");

		// Register skills directory (WCS needs to know where skills are)
		wcsClient.RegisterDirectory(
			ReplicatedStorage.WaitForChild("TS").WaitForChild("combat") as Folder,
		);

		// Start the WCS client
		wcsClient.Start();
		print("[WCSController] WCS Client started");

		const localPlayer = Players.LocalPlayer;

		// Set up character tracking
		localPlayer.CharacterAdded.Connect((characterModel) => {
			this.onCharacterAdded(characterModel);
		});

		// Handle existing character
		if (localPlayer.Character) {
			this.onCharacterAdded(localPlayer.Character);
		}

		// Set up input handling
		this.setupInputHandling();

		print("[WCSController] Initialized");
	}

	private onCharacterAdded(characterModel: Model) {
		// Wait a frame for WCS Character to be created on server
		task.defer(() => {
			const wcsCharacter = Character.GetCharacterFromInstance(characterModel);
			if (wcsCharacter) {
				this.localCharacter = wcsCharacter;
				print(`[WCSController] Found WCS Character for ${characterModel.Name}`);
			} else {
				// Retry after a short delay if not found
				task.delay(0.5, () => {
					const retryCharacter = Character.GetCharacterFromInstance(characterModel);
					if (retryCharacter) {
						this.localCharacter = retryCharacter;
						print(`[WCSController] Found WCS Character on retry`);
					} else {
						warn("[WCSController] Could not find WCS Character");
					}
				});
			}
		});
	}

	private setupInputHandling() {
		// Attack on left mouse click
		UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
			// Ignore if UI is handling the input
			if (gameProcessedEvent) return;

			// Left mouse button for melee attack
			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				this.tryMeleeAttack();
			}

			// Keyboard key "F" as alternative melee attack
			if (input.KeyCode === Enum.KeyCode.F) {
				this.tryMeleeAttack();
			}

			// Keyboard key "E" for Fireball
			if (input.KeyCode === Enum.KeyCode.E) {
				this.tryFireball();
			}
		});
	}

	private tryMeleeAttack() {
		if (!this.localCharacter) {
			warn("[WCSController] No local WCS character");
			return;
		}

		// Get the MeleeAttack skill from the character
		const meleeSkill = this.localCharacter.GetSkillFromConstructor(MeleeAttack);

		if (!meleeSkill) {
			warn("[WCSController] MeleeAttack skill not found on character");
			return;
		}

		// Start the skill (automatically sends request to server)
		meleeSkill.Start();
		print("[WCSController] Started MeleeAttack");
	}

	private tryFireball() {
		if (!this.localCharacter) {
			warn("[WCSController] No local WCS character");
			return;
		}

		// Get the Fireball skill from the character
		const fireballSkill = this.localCharacter.GetSkillFromConstructor(Fireball);

		if (!fireballSkill) {
			warn("[WCSController] Fireball skill not found on character");
			return;
		}

		// Start the skill (automatically sends request to server)
		fireballSkill.Start();
		print("[WCSController] Started Fireball");
	}
}
