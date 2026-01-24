import { Players } from "@rbxts/services";
import { Character } from "@rbxts/wcs";
import MyMoveset from "./movesets/myMoveset";

// Initialize WCS for each player's character
Players.PlayerAdded.Connect((player) => {
	player.CharacterAdded.Connect((characterModel) => {
		// Create WCS Character wrapper
		const wcsCharacter = new Character(characterModel);

		// Apply a moveset (optional - adds all skills from the moveset)
		wcsCharacter.ApplyMoveset(MyMoveset);

		// Or apply individual skills:
		// new MySkill(wcsCharacter);

		// Set default humanoid properties (optional)
		wcsCharacter.SetDefaultProps({
			WalkSpeed: 16,
			JumpPower: 50,
		});

		// Clean up when character dies
		const humanoid = characterModel.WaitForChild("Humanoid") as Humanoid;
		humanoid.Died.Once(() => wcsCharacter.Destroy());
	});
});
