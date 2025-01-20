import { Routes, Route } from "react-router-dom";

import Main from "./main";
import Homepage from "./pages/Homepage";

import { DecryptRecord } from "./tabs/encrypt-decrypt/DecryptRecord";
import { EncryptRecord } from "./tabs/encrypt-decrypt/EncryptRecord";
import { HashMessage } from "./tabs/hashing/Hashing";
import { DokoIDE } from "./components/Editor/DokoIDE";

import "./index.css";
import Docs from "./pages/Docs";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/docs" element={<Docs />} />

            <Route element={<Main />}>
                <Route path="/demo" element={<DokoIDE />} />
                <Route path="/encrypt-decrypt" element={
                    <>
                        <DecryptRecord />
                        <br />
                        <EncryptRecord />
                    </>
                } />
                <Route path="/hashing" element={<HashMessage />} />
            </Route>
        </Routes>
    );
};

export default App;