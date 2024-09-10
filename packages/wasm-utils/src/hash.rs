use std::str::FromStr;

use anyhow::{Context, Result};

use snarkvm_console::{
    network::{MainnetV0, Network, TestnetV0},
    prelude::ToBits,
    program::{Literal, LiteralType, Plaintext},
};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

use super::{AleoNetwork, NetworkCtx};

impl<N: Network> NetworkCtx<N> {
    pub fn hash(alg: &str, val: &str, out: &str) -> Result<String> {
        let input = Plaintext::<N>::from_str(val)?;
        let dest = LiteralType::from_str(out)?;

        let output = match alg {
            "bhp256" => {
                N::hash_to_group_bhp256(&input.to_bits_le()).context("Hashing failed for bhp256")?
            }
            "bhp512" => {
                N::hash_to_group_bhp512(&input.to_bits_le()).context("Hashing failed for bhp512")?
            }
            "bhp768" => {
                N::hash_to_group_bhp768(&input.to_bits_le()).context("Hashing failed for bhp768")?
            }
            "bhp1024" => N::hash_to_group_bhp1024(&input.to_bits_le())
                .context("Hashing failed for bhp1024")?,
            "keccak256" => N::hash_to_group_bhp256(
                &N::hash_keccak256(&input.to_bits_le()).context("Hashing failed for keccak256")?,
            )
            .context("grouping failed for keccak384")?,
            "keccak384" => N::hash_to_group_bhp512(
                &N::hash_keccak384(&input.to_bits_le()).context("Hashing failed for keccak512")?,
            )
            .context("grouping failed for keccak384")?,
            "keccak512" => N::hash_to_group_bhp512(
                &N::hash_keccak512(&input.to_bits_le()).context("Hashing failed for keccak512")?,
            )
            .context("grouping failed for keccak384")?,
            "ped64" => {
                N::hash_to_group_ped64(&input.to_bits_le()).context("Hashing failed for ped64")?
            }
            "ped128" => {
                N::hash_to_group_ped128(&input.to_bits_le()).context("Hashing failed for ped128")?
            }
            "sha3_256" => N::hash_to_group_bhp256(
                &N::hash_sha3_256(&input.to_bits_le()).context("Hashing failed for sha3_256")?,
            )
            .context("grouping failed for sha3_256")?,
            "sha3_384" => N::hash_to_group_bhp512(
                &N::hash_sha3_256(&input.to_bits_le()).context("Hashing failed for sha3_384")?,
            )
            .context("grouping failed for sha3_384")?,
            "sha3_512" => N::hash_to_group_bhp512(
                &N::hash_sha3_256(&input.to_bits_le()).context("Hashing failed for sha3_512")?,
            )
            .context("grouping failed for sha3_512")?,
            _ => panic!("algorithm not supported"),
        };

        let casted = Literal::Group(output)
            .cast_lossy(dest)
            .context("failed to cast to given literal type")?;
        Ok(casted.to_string())
    }
}

#[wasm_bindgen(js_namespace = hash)]
pub fn hasher(alg: &str, val: &str, out: &str, network: AleoNetwork) -> JsValue {
    let res = match network {
        AleoNetwork::Testnet => NetworkCtx::<TestnetV0>::hash(alg, val, out),
        AleoNetwork::Mainnet => NetworkCtx::<MainnetV0>::hash(alg, val, out),
        _ => Err(anyhow::Error::msg("Invalid Aleo Network")),
    };
    match res {
        Ok(d) => JsValue::from_str(&d),
        Err(e) => JsValue::from_str(&e.to_string()),
    }
}

#[test]
fn test_direct() {
    let algorithm = "keccak256";
    let val = "{arr: [1u8, 1u8], size: 2u8}";
    let destination_type = "address";

    let g = hasher(algorithm, val, destination_type, AleoNetwork::Testnet);

    println!("{:?}", g);
}
