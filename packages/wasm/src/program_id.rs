use anyhow::{Context, Result};

use snarkvm_console::{
    network::{MainnetV0, TestnetV0},
    program::{Network, ProgramID},
};
use wasm_bindgen::prelude::wasm_bindgen;

use super::{AleoNetwork, NetworkCtx};

impl<N: Network> NetworkCtx<N> {
    fn string_to_program(program: String) -> Result<ProgramID<N>> {
        ProgramID::<N>::try_from(program).context("failed to prase programID from string")
    }

    fn program_to_address(program: String) -> Result<String> {
        Ok(Self::string_to_program(program)?.to_address()?.to_string())
    }
}

#[wasm_bindgen(js_name = "to_address")]
pub fn program_to_address(program: String, network: AleoNetwork) -> String {
    match network {
        AleoNetwork::Mainnet => NetworkCtx::<MainnetV0>::program_to_address(program).unwrap(),
        AleoNetwork::Testnet => NetworkCtx::<TestnetV0>::program_to_address(program).unwrap(),
        _ => panic!("Invalid network type"),
    }
}

#[test]
fn test_program_to_address() {
    let address = program_to_address("credits.aleo".to_string(), AleoNetwork::Testnet);
    let real_address =
        "aleo1lqmly7ez2k48ajf5hs92ulphaqr05qm4n8qwzj8v0yprmasgpqgsez59gg".to_string();
    assert_eq!(address, real_address);
}
