import { CreateMoveset } from "@rbxts/wcs";
import { Skill1 } from "./skills/skill1";
import { Skill2 } from "./skills/skill2";
import { Skill3 } from "./skills/skill3";

// Create a moveset that groups multiple skills together
// When applied to a character, all skills are added at once
export = CreateMoveset("MyMoveset", [Skill1, Skill2, Skill3]);
