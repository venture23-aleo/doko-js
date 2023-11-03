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

export interface NFT {
  nft_type: number; 
  id: number; 
  nft_owner: string; 
}

export const leoNFTSchema = z.object({
  nft_type: leoU16Schema, 
  id: leoU16Schema, 
  nft_owner: leoAddressSchema, 
})
export type NFTLeo = z.infer<typeof leoNFTSchema>

