"use client";
import { useEffect, useState } from "react";

let loadingPromise: any = null;
let loadedSDK: any = null;

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
