export async function getEdition(
  programName: string,
  network: string,
  endpoint: string
): Promise<string> {
  const url = `${endpoint}/${network}/program/${programName}/latest_edition`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.toString();
  } catch (error) {
    console.error(
      `Error fetching latest edition for ${programName} in ${network} from ${endpoint}`
    );
    console.error(`Error: ${error}. Defaulting to edition 0`);
    return '0';
  }
}

// console.log(typeof await getEdition('amm_reserve_state_v003.aleo', 'testnet', 'https://api.explorer.provable.com/v1'), await getEdition('amm_reserve_state_v003.aleo', 'testnet', 'https://api.explorer.provable.com/v1'))
