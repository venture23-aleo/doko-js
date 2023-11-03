import {
	PrimaryStats, PrimaryStatsLeo,
	SecondaryStats, SecondaryStatsLeo,
	Weapon, WeaponLeo,
	Character, CharacterLeo,
	Team, TeamLeo,
	GangwarSettings, GangwarSettingsLeo,
	PhysicalAttack, PhysicalAttackLeo,
	Damage, DamageLeo,
	Signature, SignatureLeo,
	HashStruct, HashStructLeo,
	CoinFlip, CoinFlipLeo,
	SigValid, SigValidLeo,
	IPhysicalAttackResponse, IPhysicalAttackResponseLeo,
	War, WarLeo,
	Player, PlayerLeo,
} from "./types"
import { u8, u16, u32, u128, u64, i8, i16, i32, i64, i128, field, scalar, group, boolean, address } from "../ts-types"

function getPrimaryStats(primaryStats: PrimaryStatsLeo): PrimaryStats {
	const result: PrimaryStats = {
		strength: u16(primaryStats.strength),
	}
	return result;
}

function getSecondaryStats(secondaryStats: SecondaryStatsLeo): SecondaryStats {
	const result: SecondaryStats = {
		health: u16(secondaryStats.health),
		dodge_chance: u16(secondaryStats.dodge_chance),
		hit_chance: u16(secondaryStats.hit_chance),
		critical_chance: u16(secondaryStats.critical_chance),
		melee_damage: u16(secondaryStats.melee_damage),
	}
	return result;
}

function getWeapon(weapon: WeaponLeo): Weapon {
	const result: Weapon = {
		id: u16(weapon.id),
		w_type: u16(weapon.w_type),
		consumption_rate: u16(weapon.consumption_rate),
		critical_chance: u16(weapon.critical_chance),
		dura_ammo: u16(weapon.dura_ammo),
		damage: u16(weapon.damage),
		hit_chance: u16(weapon.hit_chance),
		number_of_hits: u16(weapon.number_of_hits),
		is_broken: boolean(weapon.is_broken),
	}
	return result;
}

function getCharacter(character: CharacterLeo): Character {
	const result: Character = {
		nft_id: u16(character.nft_id),
		player_addr: address(character.player_addr),
		primary_stats: getPrimaryStats(character.primary_stats),
		secondary_stats: getSecondaryStats(character.secondary_stats),
		primary_equipment: getWeapon(character.primary_equipment),
	}
	return result;
}

function getTeam(team: TeamLeo): Team {
	const result: Team = {
		p1: getCharacter(team.p1),
		p2: getCharacter(team.p2),
		p3: getCharacter(team.p3),
	}
	return result;
}

function getGangwarSettings(gangwarSettings: GangwarSettingsLeo): GangwarSettings {
	const result: GangwarSettings = {
		created_at: u32(gangwarSettings.created_at),
		deadline_to_register: u32(gangwarSettings.deadline_to_register),
		max_number_of_players: u8(gangwarSettings.max_number_of_players),
		max_rounds: u8(gangwarSettings.max_rounds),
		participation_lootcrate_count: u8(gangwarSettings.participation_lootcrate_count),
		winner_lootcrate_count: u8(gangwarSettings.winner_lootcrate_count),
		registered_players: u8(gangwarSettings.registered_players),
		random_number: u16(gangwarSettings.random_number),
	}
	return result;
}

function getPhysicalAttack(physicalAttack: PhysicalAttackLeo): PhysicalAttack {
	const result: PhysicalAttack = {
		main: u8(physicalAttack.main),
		target: u8(physicalAttack.target),
		is_dodged: boolean(physicalAttack.is_dodged),
		is_critical: boolean(physicalAttack.is_critical),
		total_normal_hits: u16(physicalAttack.total_normal_hits),
		total_critical_hits: u16(physicalAttack.total_critical_hits),
		damage: u16(physicalAttack.damage),
	}
	return result;
}

function getDamage(damage: DamageLeo): Damage {
	const result: Damage = {
		is_dodged: boolean(damage.is_dodged),
		is_critical: boolean(damage.is_critical),
		total_critical_hits: u16(damage.total_critical_hits),
		total_normal_hits: u16(damage.total_normal_hits),
		damage: u16(damage.damage),
	}
	return result;
}

function getSignature(signature: SignatureLeo): Signature {
	const result: Signature = {
		r: group(signature.r),
		s: group(signature.s),
	}
	return result;
}

function getHashStruct(hashStruct: HashStructLeo): HashStruct {
	const result: HashStruct = {
		m: getCharacter(hashStruct.m),
		simulation_id: u32(hashStruct.simulation_id),
		r: group(hashStruct.r),
	}
	return result;
}

function getCoinFlip(coinFlip: CoinFlipLeo): CoinFlip {
	const result: CoinFlip = {
		result: boolean(coinFlip.result),
		new_random_number: u16(coinFlip.new_random_number),
	}
	return result;
}

function getSigValid(sigValid: SigValidLeo): SigValid {
	const result: SigValid = {
		valid: boolean(sigValid.valid),
	}
	return result;
}

function getIPhysicalAttackResponse(iPhysicalAttackResponse: IPhysicalAttackResponseLeo): IPhysicalAttackResponse {
	const result: IPhysicalAttackResponse = {
		updated_main_character: getCharacter(iPhysicalAttackResponse.updated_main_character),
		updated_target_character: getCharacter(iPhysicalAttackResponse.updated_target_character),
		physical_attack: getDamage(iPhysicalAttackResponse.physical_attack),
		new_random_number: u16(iPhysicalAttackResponse.new_random_number),
	}
	return result;
}

function getWar(war: WarLeo): War {
	const result: War = {
		owner: address(war.owner),
		simulation_id: u32(war.simulation_id),
		round: u8(war.round),
		main_team: getTeam(war.main_team),
		target_team: getTeam(war.target_team),
		physical_attack: getPhysicalAttack(war.physical_attack),
	}
	return result;
}

function getPlayer(player: PlayerLeo): Player {
	const result: Player = {
		owner: address(player.owner),
		simulation_id: u32(player.simulation_id),
		char: getCharacter(player.char),
	}
	return result;
}

