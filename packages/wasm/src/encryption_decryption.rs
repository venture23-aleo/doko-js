use anyhow::{Context, Result};
use std::str::FromStr;

use snarkvm_console::{
    account::{PrivateKey, ViewKey},
    algorithms::{Field, Group, U16},
    network::{MainnetV0, Network, TestnetV0},
    program::{compute_function_id, Ciphertext, Identifier, Plaintext, ProgramID},
};
use wasm_bindgen::{prelude::*, JsValue};

use super::{AleoNetwork, NetworkCtx};

impl<N: Network> NetworkCtx<N> {
    fn get_tvk(pk: &str, tpk: &str) -> Result<Field<N>> {
        let pk = PrivateKey::<N>::from_str(pk).context("failed to parse private key")?;
        let view_key =
            ViewKey::<N>::try_from(pk).context("failed to parse view key from private key")?;
        let tpk = Group::<N>::from_str(tpk).context("failed to group tpk")?;

        let tvk = *view_key * tpk;
        Ok(tvk.to_x_coordinate())
    }

    fn get_tvk_using_view_key(vk: &str, tpk: &str) -> Result<Field<N>> {
        let view_key =
            ViewKey::<N>::from_str(vk).context("failed to parse view key")?;
        let tpk = Group::<N>::from_str(tpk).context("failed to group tpk")?;

        let tvk = *view_key * tpk;
        Ok(tvk.to_x_coordinate())
    }

    fn get_fn_id(program: &str, fn_name: &str) -> Result<Field<N>> {
        let program_id = ProgramID::<N>::try_from(program).context("failed to parse program id")?;
        let fn_name =
            Identifier::<N>::try_from(fn_name).context("failed to parse function name")?;
        let network_id = U16::new(N::ID);
        compute_function_id(&network_id, &program_id, &fn_name)
            .context("failed to compute function id")
    }

    fn get_input_vk(
        program: &str,
        fn_name: &str,
        input_index: u16,
        pk: &str,
        tpk: &str,
    ) -> Result<Field<N>> {
        let fn_id = Self::get_fn_id(program, fn_name)?;
        let tvk = Self::get_tvk(pk, tpk)?;
        let index = Field::<N>::from_u16(input_index);
        N::hash_psd4(&[fn_id, tvk, index]).context("hasihing to psd4 failed")
    }

    fn get_input_vk_using_view_key(
        program: &str,
        fn_name: &str,
        input_index: u16,
        vk: &str,
        tpk: &str,
    ) -> Result<Field<N>> {
        let fn_id = Self::get_fn_id(program, fn_name)?;
        let tvk = Self::get_tvk_using_view_key(vk, tpk)?;
        let index = Field::<N>::from_u16(input_index);
        N::hash_psd4(&[fn_id, tvk, index]).context("hasihing to psd4 failed")
    }

    fn encrypt_plaintext(
        val: &str,
        program: &str,
        fn_name: &str,
        input_index: u16,
        pk: &str,
        tpk: &str,
    ) -> Result<String> {
        let val = Plaintext::<N>::from_str(val).unwrap();
        let input_view_key = Self::get_input_vk(program, fn_name, input_index, pk, tpk)?;
        let ciphertext = val
            .encrypt_symmetric(input_view_key)
            .context("failed to encrypt symmetric")?;
        Ok(ciphertext.to_string())
    }

    fn decrypt_ciphertext(
        cipher: &str,
        program: &str,
        fn_name: &str,
        input_index: u16,
        pk: &str,
        tpk: &str,
    ) -> Result<String> {
        let cipher = Ciphertext::<N>::from_str(cipher).context("failed to parse ciphertext")?;
        let input_vk = Self::get_input_vk(program, fn_name, input_index, pk, tpk)?;
        let decrypted = cipher
            .decrypt_symmetric(input_vk)
            .context("failed to decryt symmetric")?;
        Ok(decrypted.to_string())
    }

    fn decrypt_ciphertext_using_view_key(
        cipher: &str,
        program: &str,
        fn_name: &str,
        input_index: u16,
        vk: &str,
        tpk: &str,
    ) -> Result<String> {
        let cipher = Ciphertext::<N>::from_str(cipher).context("failed to parse ciphertext")?;
        let input_vk = Self::get_input_vk_using_view_key(program, fn_name, input_index, vk, tpk)?;
        let decrypted = cipher
            .decrypt_symmetric(input_vk)
            .context("failed to decryt symmetric")?;
        Ok(decrypted.to_string())
    }
}
#[wasm_bindgen]
pub struct Encrypter;

#[wasm_bindgen]
impl Encrypter {
    pub fn get_encrypted_value(
        val: &str,
        program: &str,
        fn_name: &str,
        input_index: u16,
        pk: &str,
        tpk: &str,
        network: AleoNetwork,
    ) -> JsValue {
        let res = match network {
            AleoNetwork::Testnet => NetworkCtx::<TestnetV0>::encrypt_plaintext(
                val,
                program,
                fn_name,
                input_index,
                pk,
                tpk,
            ),
            AleoNetwork::Mainnet => NetworkCtx::<MainnetV0>::encrypt_plaintext(
                val,
                program,
                fn_name,
                input_index,
                pk,
                tpk,
            ),
            _ => Err(anyhow::Error::msg("Invalid Network")),
        };

        match res {
            Ok(r) => JsValue::from_str(&r),
            Err(e) => JsValue::from_str(&e.to_string()),
        }
    }
}
#[wasm_bindgen]
pub struct Decrypter;

#[wasm_bindgen]
impl Decrypter {
    pub fn get_decrypted_value(
        cipher: &str,
        program: &str,
        fn_name: &str,
        input_index: u16,
        pk: &str,
        tpk: &str,
        network: AleoNetwork,
    ) -> JsValue {
        let res = match network {
            AleoNetwork::Testnet => NetworkCtx::<TestnetV0>::decrypt_ciphertext(
                cipher,
                program,
                fn_name,
                input_index,
                pk,
                tpk,
            ),
            AleoNetwork::Mainnet => NetworkCtx::<MainnetV0>::decrypt_ciphertext(
                cipher,
                program,
                fn_name,
                input_index,
                pk,
                tpk,
            ),
            _ => Err(anyhow::Error::msg("Invalid Network")),
        };

        match res {
            Ok(r) => JsValue::from_str(&r),
            Err(e) => JsValue::from_str(&e.to_string()),
        }
    }

    pub fn get_decrypted_value_using_view_key(
        cipher: &str,
        program: &str,
        fn_name: &str,
        input_index: u16,
        vk: &str,
        tpk: &str,
        network: AleoNetwork,
    ) -> JsValue {
        let res = match network {
            AleoNetwork::Testnet => NetworkCtx::<TestnetV0>::decrypt_ciphertext_using_view_key(
                cipher,
                program,
                fn_name,
                input_index,
                vk,
                tpk,
            ),
            AleoNetwork::Mainnet => NetworkCtx::<MainnetV0>::decrypt_ciphertext_using_view_key(
                cipher,
                program,
                fn_name,
                input_index,
                vk,
                tpk,
            ),
            _ => Err(anyhow::Error::msg("Invalid Network")),
        };

        match res {
            Ok(r) => JsValue::from_str(&r),
            Err(e) => JsValue::from_str(&e.to_string()),
        }
    }
}

#[test]
fn test_decryption2() {
    let val = "3u32";
    let program_name = "types_test.aleo";
    let function_name = "sum";
    let input_index = 2;
    let private_key = "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH";
    let tpk = "4894085870840878070008938887517642593787940398952348563490477594935969679255group";
    let cipher =
        String::from("ciphertext1qyqv5fj8jc4enpvl8xdkxllvdhxe49qz3mn72xmr574ve5n4qtuawpgs4egw3"); //get_encrypted_value(val, program_name, function_name, input_index, private_key, tpk);\

    let plain = Decrypter::get_decrypted_value(
        cipher.as_str(),
        program_name,
        function_name,
        input_index,
        private_key,
        tpk,
        AleoNetwork::Testnet,
    );
    assert_eq!(plain, val);
}

fn test_decryption3() {
    let val = "3u32";
    let program_name = "types_test.aleo";
    let function_name = "sum";
    let input_index = 2;
    let view_key = "AViewKey1mSnpFFC8Mj4fXbK5YiWgZ3mjiV8CxA79bYNa8ymUpTrw";
    let tpk = "4894085870840878070008938887517642593787940398952348563490477594935969679255group";
    let cipher =
        String::from("ciphertext1qyqv5fj8jc4enpvl8xdkxllvdhxe49qz3mn72xmr574ve5n4qtuawpgs4egw3"); //get_encrypted_value(val, program_name, function_name, input_index, private_key, tpk);\

    let plain = Decrypter::get_decrypted_value_using_view_key(
        cipher.as_str(),
        program_name,
        function_name,
        input_index,
        view_key,
        tpk,
        AleoNetwork::Testnet,
    );
    assert_eq!(plain, val);
}
