use snarkvm_console::program::Network;

use wasm_bindgen::prelude::wasm_bindgen;

pub mod encryption_decryption;
pub mod hash;
pub mod program_id;

#[wasm_bindgen]
pub enum AleoNetwork {
    Testnet = "testnet",
    Mainnet = "mainnet",
}

pub struct NetworkCtx<N: Network> {
    _network: std::marker::PhantomData<N>,
}
