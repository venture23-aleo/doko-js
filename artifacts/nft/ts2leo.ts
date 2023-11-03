import {
	NFT, NFTLeo,
} from "./types"
import { u8, u16, u32, u128, u64, i8, i16, i32, i64, i128, field, scalar, group, boolean, address } from "../leo-types"

function getNFTLeo(nFT: NFT): NFTLeo {
	const result: NFTLeo = {
		nft_type: u16(nFT.nft_type),
		id: u16(nFT.id),
		nft_owner: address(nFT.nft_owner),
	}
	return result;
}

