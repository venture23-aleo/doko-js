"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndInstallRequirements = void 0;
const child_process_1 = require("child_process");
const readline_1 = __importDefault(require("readline"));
const os_1 = __importDefault(require("os"));
const isWindows = () => {
    return os_1.default.platform() === "win32";
};
const isMacOS = () => {
    return os_1.default.platform() === "darwin";
};
const isLinux = () => {
    return os_1.default.platform() === "linux";
};
const checkProgramInstallation = (command) => {
    let isInstalled = false;
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
        isInstalled = !error;
    });
    return isInstalled;
};
const installRust = () => {
    (0, child_process_1.exec)("../scripts/install_rust.sh", (error, stdout, stderr) => {
        if (!error) {
            console.log('Rust installed successfully.');
        }
        else {
            console.error('Error installing Rust:', error);
            process.exit(1);
        }
    });
};
const installAleo = () => {
    console.log("Installing aleo..");
    (0, child_process_1.exec)('ls', (error, stdout, stderr) => {
        if (!error) {
            console.log('Aleo installed successfully.');
        }
        else {
            console.error('Error installing Aleo:', error);
            process.exit(1);
        }
    });
};
const installSnarkOS = () => {
    console.log("Installing SnarkOS..");
    (0, child_process_1.exec)('ls', (error, stdout, stderr) => {
        if (!error) {
            console.log('SnarkOS installed successfully.');
        }
        else {
            console.error('Error installing SnarkOS:', error);
            process.exit(1);
        }
    });
};
const checkAndInstallRequirements = () => {
    const isRustInstalled = checkProgramInstallation('rustc --version');
    ;
    const isAleoInstalled = checkProgramInstallation('aleo --version');
    const isSnarkOsInstalled = checkProgramInstallation('snarkos --version');
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const needSetup = [];
    if (!isRustInstalled)
        needSetup.push("Rust");
    if (!isSnarkOsInstalled)
        needSetup.push("SnarkOs");
    if (!isAleoInstalled)
        needSetup.push("Aleo");
    if (needSetup.length > 0) {
        const qq = needSetup.map((v, index) => index + 1 + "." + v + "\n").join("");
        const questionString = "Need following programs to init. Do you want to continue with installation? \n\n" + qq + "\n (yes/no/y/n): ";
        if (isWindows()) {
            console.log("Please install following for initialization \n" + qq);
            process.exit(0);
        }
        rl.question(questionString, (_answer) => {
            const answer = _answer.toLowerCase();
            if (answer === 'yes' || answer === "y") {
                if (!isRustInstalled) {
                    installRust();
                }
                if (!isSnarkOsInstalled) {
                    installSnarkOS();
                }
                if (!isAleoInstalled) {
                    installAleo();
                }
            }
            else {
                console.log('Installation skipped.');
            }
            rl.close();
        });
    }
};
exports.checkAndInstallRequirements = checkAndInstallRequirements;
//# sourceMappingURL=requirementsCheck.js.map