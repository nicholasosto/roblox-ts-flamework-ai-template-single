/// <reference types="@rbxts/types" />

/**
 * Managed Image Assets (developer-curated)
 *
 * This file intentionally provides stable, working image IDs for UI/catalog usage
 * by leveraging the shared UI library constants (rbxassetid://). It prevents
 * breakages while the automated asset pipeline (asset-map.json -> generator)
 * is still being populated with uploads.
 *
 * When your asset map is complete, you can switch back to the generated file
 * or extend the generator to include these groupings directly.
 */


const AbilityIcons = {
  MeleeSkill: "rbxassetid://114327486101696",
  Whirlwind: "rbxassetid://118559350384271",
  Fireball: "rbxassetid://124529752479830",
  Ice_Rain: "rbxassetid://77085115837905",
  Lightning_Bolt: "rbxassetid://84562572112570",
  Earthquake: "rbxassetid://72703784685790",
  Flame_Sythe: "rbxassetid://108246514585300",
  HallowHold: "rbxassetid://79001631229851",
  Blood_Siphon: "rbxassetid://135950973087916",
  Blood_Horror: "rbxassetid://82257212198629",
  Blood_Elemental: "rbxassetid://122556254156811",
  Soul_Drain: "rbxassetid://78703065651895",
};

const AttributeIcons = {
  Spirit: "rbxassetid://76174031397497",
  Strength: "rbxassetid://127745571044516",
  Agility: "rbxassetid://73893872719367",
  Intelligence: "rbxassetid://107600003376684",
  Vitality: "rbxassetid://121291227474039",
  Luck: "rbxassetid://114767496083209",
};

const ClassIcons = {
  Warrior: "rbxassetid://115888614111404",
  Mage: "rbxassetid://137115253994988",
  Rogue: "rbxassetid://114675020831306",
  Cleric: "rbxassetid://90530068222238",
};

const ConsumableIcons = {
  HealthPotion: "rbxassetid://1234567890", // placeholder
  ManaPotion: "rbxassetid://1234567890", // placeholder
  StaminaPotion: "rbxassetid://1234567890", // placeholder
};
const CurrencyIcons = {
  Coins: "rbxassetid://127745571044516",
  Shards: "rbxassetid://73893872719367",
  Tombs: "rbxassetid://121291227474039",
};

const DomainIcons = {
  Chaos: "rbxassetid://80375133768026",
  Order: "rbxassetid://134322739825066",
  Void: "rbxassetid://134322739825066",
};
const GemIcons = {
  Colorable: "rbxassetid://71842732472075",
  Common: "rbxassetid://71842732472075",
  Uncommon: "rbxassetid://71842732472075",
  Rare: "rbxassetid://71842732472075",
  Epic: "rbxassetid://119000054151103",
  Legendary: "rbxassetid://71842732472075",
};
const ItemSlotIcons = {
  Unassigned: "rbxassetid://98384046526938",
  Helmet: "rbxassetid://124443221759409",
  Armor: "rbxassetid://127400433082189",
  Weapon: "rbxassetid://84241490307717",
  Accessory: "rbxassetid://131561781044540",
};
const MenuPanelIcons = {
  Settings: "rbxassetid://122289639886993",
  Inventory: "rbxassetid://132702292243603",
  Quests: "rbxassetid://129030346503415", 
  Character: "rbxassetid://100274464430589",
  Forge: "rbxassetid://116506062642047", 
  Shop: "rbxassetid://101998590177560",
  Teleport: "rbxassetid://127118741571164",
};
const PanelBackgrounds = {
  Chaos: "rbxassetid://84301389774700",
  Void: "rbxassetid://129286641336578",
  Order: "rbxassetid://84630369308490",
};
const RarityFrames = {
  CommonSet: "rbxassetid://85778039199330",
  RareSet: "rbxassetid://82228066842612",
  EpicSet: "rbxassetid://135166624307221",
  LegendarySet: "rbxassetid://85570068018789",
};
const StatusIcons = {
  DarkEnergy: "rbxassetid://112790635225543",
  LightEnergy: "rbxassetid://128191185980101",
  Might: "rbxassetid://121141253261646",
  Chill: "rbxassetid://106953131478004",
  FlightChill: "rbxassetid://95573543624955",
  Shattered: "rbxassetid://135235376575135",
};
const TextureImages = {
  BoneDoily: "rbxassetid://108018297611555",
  Mystical: "rbxassetid://108018297611556",
  WavyMetal: "rbxassetid://99123505462124",
};
const UIControlIcons = {
  Increment: "rbxassetid://102421835119714",
  Decrement: "rbxassetid://78091115085992",
  Close: "rbxassetid://91437543746962",
  TripleArrow: "rbxassetid://136693752293641",
  Play: "rbxassetid://138751166365431",
};

const PanelOverlays = {
  DefaultFrame: "rbxassetid://80375133768026",
};

export const ManagedImageAssets = {
  TODO_Icon: "rbxassetid://99268692976581", // placeholder image
  AbilityIcons: AbilityIcons,
  AttributeIcons: AttributeIcons,
  ClassIcons: ClassIcons,
  ConsumableIcons: ConsumableIcons,
  CurrencyIcons: CurrencyIcons,
  DomainIcons: DomainIcons,
  GemIcons: GemIcons,
  ItemSlotIcons: ItemSlotIcons,
  MenuPanelIcons: MenuPanelIcons,
  PanelBackgrounds: PanelBackgrounds,
  
  RarityFrames: RarityFrames,
  StatusIcon: StatusIcons,
  TextureImage: TextureImages,
  UIControlIcons: UIControlIcons,  
  PanelOverlays: PanelOverlays,
} as const;
