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
import { u8, u16, u32, u128, u64, i8, i16, i32, i64, i128, field, scalar, group, boolean, address } from "../leo-types"

function getPrimaryStatsLeo(primaryStats: PrimaryStats): PrimaryStatsLeo {
	const result: PrimaryStatsLeo = {
		strength: u16(primaryStats.strength),
	}
	return result;
}

function getSecondaryStatsLeo(secondaryStats: SecondaryStats): SecondaryStatsLeo {
	const result: SecondaryStatsLeo = {
		health: u16(secondaryStats.health),
		dodge_chance: u16(secondaryStats.dodge_chance),
		hit_chance: u16(secondaryStats.hit_chance),
		critical_chance: u16(secondaryStats.critical_chance),
		melee_damage: u16(secondaryStats.melee_damage),
	}
	return result;
}

function getWeaponLeo(weapon: Weapon): WeaponLeo {
	const result: WeaponLeo = {
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

function getCharacterLeo(character: Character): CharacterLeo {
	const result: CharacterLeo = {
		nft_id: u16(character.nft_id),
		player_addr: address(character.player_addr),
		primary_stats: getPrimaryStatsLeo(character.primary_stats),
		secondary_stats: getSecondaryStatsLeo(character.secondary_stats),
		primary_equipment: getWeaponLeo(character.primary_equipment),
	}
	return result;
}

function getTeamLeo(team: Team): TeamLeo {
	const result: TeamLeo = {
		p1: getCharacterLeo(team.p1),
		p2: getCharacterLeo(team.p2),
		p3: getCharacterLeo(team.p3),
	}
	return result;
}

function getGangwarSettingsLeo(gangwarSettings: GangwarSettings): GangwarSettingsLeo {
	const result: GangwarSettingsLeo = {
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

function getPhysicalAttackLeo(physicalAttack: PhysicalAttack): PhysicalAttackLeo {
	const result: PhysicalAttackLeo = {
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

function getDamageLeo(damage: Damage): DamageLeo {
	const result: DamageLeo = {
		is_dodged: boolean(damage.is_dodged),
		is_critical: boolean(damage.is_critical),
		total_critical_hits: u16(damage.total_critical_hits),
		total_normal_hits: u16(damage.total_normal_hits),
		damage: u16(damage.damage),
	}
	return result;
}

function getSignatureLeo(signature: Signature): SignatureLeo {
	const result: SignatureLeo = {
		r: group(signature.r),
		s: group(signature.s),
	}
	return result;
}

function getHashStructLeo(hashStruct: HashStruct): HashStructLeo {
	const result: HashStructLeo = {
		m: getCharacterLeo(hashStruct.m),
		simulation_id: u32(hashStruct.simulation_id),
		r: group(hashStruct.r),
	}
	return result;
}

function getCoinFlipLeo(coinFlip: CoinFlip): CoinFlipLeo {
	const result: CoinFlipLeo = {
		result: boolean(coinFlip.result),
		new_random_number: u16(coinFlip.new_random_number),
	}
	return result;
}

function getSigValidLeo(sigValid: SigValid): SigValidLeo {
	const result: SigValidLeo = {
		valid: boolean(sigValid.valid),
	}
	return result;
}

function getIPhysicalAttackResponseLeo(iPhysicalAttackResponse: IPhysicalAttackResponse): IPhysicalAttackResponseLeo {
	const result: IPhysicalAttackResponseLeo = {
		updated_main_character: getCharacterLeo(iPhysicalAttackResponse.updated_main_character),
		updated_target_character: getCharacterLeo(iPhysicalAttackResponse.updated_target_character),
		physical_attack: getDamageLeo(iPhysicalAttackResponse.physical_attack),
		new_random_number: u16(iPhysicalAttackResponse.new_random_number),
	}
	return result;
}

function getWarLeo(war: War): WarLeo {
	const result: WarLeo = {
		owner: address(war.owner),
		simulation_id: u32(war.simulation_id),
		round: u8(war.round),
		main_team: getTeamLeo(war.main_team),
		target_team: getTeamLeo(war.target_team),
		physical_attack: getPhysicalAttackLeo(war.physical_attack),
	}
	return result;
}

function getPlayerLeo(player: Player): PlayerLeo {
	const result: PlayerLeo = {
		owner: address(player.owner),
		simulation_id: u32(player.simulation_id),
		char: getCharacterLeo(player.char),
	}
	return result;
}

