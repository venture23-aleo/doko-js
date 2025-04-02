import { useEffect, useState } from "react";
import initWasm from "@doko-js/wasm"

let loadingPromise: any = null;
let loadedSDK: any = null;

async function run() {
    const wasm = await initWasm(); // Ensure the WASM module is loaded before use
    console.log("WASM initialized", wasm);
}

export const useDokoJsWASM = () => {
    const [dokoWasmInstance, setDokoWasmInstance] = useState(loadedSDK);
    const [loading, setLoading] = useState(!loadedSDK);

    const loadWasm = async () => {
        if (loadedSDK) {
            setDokoWasmInstance(loadedSDK);
            setLoading(false);
            return;
        }
        if (typeof window !== 'undefined') {
            if (!loadingPromise) {
                await run();
                loadingPromise = import("@doko-js/wasm")
                    .then(async (sdk) => {
                        console.log("SDK loaded:", sdk.Decrypter);
                        loadedSDK = sdk;
                        setDokoWasmInstance(sdk);
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error("Failed to load the SDK:", error);
                        setLoading(false);
                    });
            } else {
                loadingPromise.then(() => {
                    setDokoWasmInstance(loadedSDK);
                    setLoading(false);
                });
            }
        }
    }

    useEffect(() => {
        loadWasm();
    }, []);

    return [dokoWasmInstance, loading];
};
