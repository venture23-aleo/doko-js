import { z } from "zod";
import { 
  leoU8Schema,
  leoU16Schema,
  leoU32Schema,
  leoU128Schema,
  leoFieldSchema,
  leoAddressSchema,
  leoBooleanSchema,
  leoGroupSchema,
  leoRecordSchema,
} from "../leo-types";

export interface PrimaryStats {
  strength: number; 
}

export const leoPrimaryStatsSchema = z.object({
  strength: leoU16Schema, 
})
export type PrimaryStatsLeo = z.infer<typeof leoPrimaryStatsSchema>

export interface SecondaryStats {
  health: number; 
  dodge_chance: number; 
  hit_chance: number; 
  critical_chance: number; 
  melee_damage: number; 
}

export const leoSecondaryStatsSchema = z.object({
  health: leoU16Schema, 
  dodge_chance: leoU16Schema, 
  hit_chance: leoU16Schema, 
  critical_chance: leoU16Schema, 
  melee_damage: leoU16Schema, 
})
export type SecondaryStatsLeo = z.infer<typeof leoSecondaryStatsSchema>

export interface Weapon {
  id: number; 
  w_type: number; 
  consumption_rate: number; 
  critical_chance: number; 
  dura_ammo: number; 
  damage: number; 
  hit_chance: number; 
  number_of_hits: number; 
  is_broken: boolean; 
}

export const leoWeaponSchema = z.object({
  id: leoU16Schema, 
  w_type: leoU16Schema, 
  consumption_rate: leoU16Schema, 
  critical_chance: leoU16Schema, 
  dura_ammo: leoU16Schema, 
  damage: leoU16Schema, 
  hit_chance: leoU16Schema, 
  number_of_hits: leoU16Schema, 
  is_broken: leoBooleanSchema, 
})
export type WeaponLeo = z.infer<typeof leoWeaponSchema>

export interface Character {
  nft_id: number; 
  player_addr: string; 
  primary_stats: PrimaryStats; 
  secondary_stats: SecondaryStats; 
  primary_equipment: Weapon; 
}

export const leoCharacterSchema = z.object({
  nft_id: leoU16Schema, 
  player_addr: leoAddressSchema, 
  primary_stats: leoPrimaryStatsSchema, 
  secondary_stats: leoSecondaryStatsSchema, 
  primary_equipment: leoWeaponSchema, 
})
export type CharacterLeo = z.infer<typeof leoCharacterSchema>

export interface Team {
  p1: Character; 
  p2: Character; 
  p3: Character; 
}

export const leoTeamSchema = z.object({
  p1: leoCharacterSchema, 
  p2: leoCharacterSchema, 
  p3: leoCharacterSchema, 
})
export type TeamLeo = z.infer<typeof leoTeamSchema>

export interface GangwarSettings {
  created_at: number; 
  deadline_to_register: number; 
  max_number_of_players: number; 
  max_rounds: number; 
  participation_lootcrate_count: number; 
  winner_lootcrate_count: number; 
  registered_players: number; 
  random_number: number; 
}

export const leoGangwarSettingsSchema = z.object({
  created_at: leoU32Schema, 
  deadline_to_register: leoU32Schema, 
  max_number_of_players: leoU8Schema, 
  max_rounds: leoU8Schema, 
  participation_lootcrate_count: leoU8Schema, 
  winner_lootcrate_count: leoU8Schema, 
  registered_players: leoU8Schema, 
  random_number: leoU16Schema, 
})
export type GangwarSettingsLeo = z.infer<typeof leoGangwarSettingsSchema>

export interface PhysicalAttack {
  main: number; 
  target: number; 
  is_dodged: boolean; 
  is_critical: boolean; 
  total_normal_hits: number; 
  total_critical_hits: number; 
  damage: number; 
}

export const leoPhysicalAttackSchema = z.object({
  main: leoU8Schema, 
  target: leoU8Schema, 
  is_dodged: leoBooleanSchema, 
  is_critical: leoBooleanSchema, 
  total_normal_hits: leoU16Schema, 
  total_critical_hits: leoU16Schema, 
  damage: leoU16Schema, 
})
export type PhysicalAttackLeo = z.infer<typeof leoPhysicalAttackSchema>

export interface Damage {
  is_dodged: boolean; 
  is_critical: boolean; 
  total_critical_hits: number; 
  total_normal_hits: number; 
  damage: number; 
}

export const leoDamageSchema = z.object({
  is_dodged: leoBooleanSchema, 
  is_critical: leoBooleanSchema, 
  total_critical_hits: leoU16Schema, 
  total_normal_hits: leoU16Schema, 
  damage: leoU16Schema, 
})
export type DamageLeo = z.infer<typeof leoDamageSchema>

export interface Signature {
  r: BigInt; 
  s: BigInt; 
}

export const leoSignatureSchema = z.object({
  r: leoGroupSchema, 
  s: leoGroupSchema, 
})
export type SignatureLeo = z.infer<typeof leoSignatureSchema>

export interface HashStruct {
  m: Character; 
  simulation_id: number; 
  r: BigInt; 
}

export const leoHashStructSchema = z.object({
  m: leoCharacterSchema, 
  simulation_id: leoU32Schema, 
  r: leoGroupSchema, 
})
export type HashStructLeo = z.infer<typeof leoHashStructSchema>

export interface CoinFlip {
  result: boolean; 
  new_random_number: number; 
}

export const leoCoinFlipSchema = z.object({
  result: leoBooleanSchema, 
  new_random_number: leoU16Schema, 
})
export type CoinFlipLeo = z.infer<typeof leoCoinFlipSchema>

export interface SigValid {
  valid: boolean; 
}

export const leoSigValidSchema = z.object({
  valid: leoBooleanSchema, 
})
export type SigValidLeo = z.infer<typeof leoSigValidSchema>

export interface IPhysicalAttackResponse {
  updated_main_character: Character; 
  updated_target_character: Character; 
  physical_attack: Damage; 
  new_random_number: number; 
}

export const leoIPhysicalAttackResponseSchema = z.object({
  updated_main_character: leoCharacterSchema, 
  updated_target_character: leoCharacterSchema, 
  physical_attack: leoDamageSchema, 
  new_random_number: leoU16Schema, 
})
export type IPhysicalAttackResponseLeo = z.infer<typeof leoIPhysicalAttackResponseSchema>

export interface War {
  owner: string; 
  simulation_id: number; 
  round: number; 
  main_team: Team; 
  target_team: Team; 
  physical_attack: PhysicalAttack; 
}

export const leoWarSchema = z.object({
  owner: leoAddressSchema, 
  simulation_id: leoU32Schema, 
  round: leoU8Schema, 
  main_team: leoTeamSchema, 
  target_team: leoTeamSchema, 
  physical_attack: leoPhysicalAttackSchema, 
})
export type WarLeo = z.infer<typeof leoWarSchema>

export interface Player {
  owner: string; 
  simulation_id: number; 
  char: Character; 
}

export const leoPlayerSchema = z.object({
  owner: leoAddressSchema, 
  simulation_id: leoU32Schema, 
  char: leoCharacterSchema, 
})
export type PlayerLeo = z.infer<typeof leoPlayerSchema>

