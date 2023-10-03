import {exec} from "child_process";
import readline from 'readline';
import os from "os";

const isWindows = () => {
    return os.platform() === "win32";
}

const isMacOS = () => {
    return os.platform() === "darwin";
}

const isLinux = () => {
    return os.platform() === "linux";
}

const checkProgramInstallation = (command: string) => {
    let isInstalled = false;
    exec(command, (error, stdout, stderr) => {
        isInstalled = !error;
    });

    return isInstalled;
}

const installRust = () => {
 exec("../scripts/install_rust.sh", (error, stdout, stderr) => {
    if (!error) {
      console.log('Rust installed successfully.');
    } else {
      console.error('Error installing Rust:', error);
      process.exit(1);
    }
  });
};

const installAleo = () => {
    console.log("Installing aleo..");
    exec('ls', (error, stdout, stderr) => {
       if (!error) {
         console.log('Aleo installed successfully.');
       } else {
         console.error('Error installing Aleo:', error);
         process.exit(1);
       }
     });
};

const installSnarkOS = () => {
    console.log("Installing SnarkOS..");
    exec('ls', (error, stdout, stderr) => {
    if (!error) {
      console.log('SnarkOS installed successfully.');
    } else {
      console.error('Error installing SnarkOS:', error);
      process.exit(1);
    }
  });
};

export const checkAndInstallRequirements = () => {
    const isRustInstalled = checkProgramInstallation('rustc --version');;
    const isAleoInstalled = checkProgramInstallation('aleo --version');
    const isSnarkOsInstalled = checkProgramInstallation('snarkos --version');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

    const needSetup = [];
    if(!isRustInstalled) needSetup.push("Rust");
    if(!isSnarkOsInstalled) needSetup.push("SnarkOs");
    if(!isAleoInstalled) needSetup.push("Aleo");

    if(needSetup.length>0) {
        const qq = needSetup.map((v, index) => index+1 + "." + v + "\n").join("");
        const questionString = "Need following programs to init. Do you want to continue with installation? \n\n" + qq + "\n (yes/no/y/n): ";

        if(isWindows()) {
         console.log("Please install following for initialization \n" + qq);
         process.exit(0);
        }
    
    rl.question(questionString, (_answer) => {
        const answer = _answer.toLowerCase();

        if (answer === 'yes' || answer === "y") {
            if(!isRustInstalled) {
                installRust();
            }
        
            if(!isSnarkOsInstalled) {
                installSnarkOS();
            }
        
            if(!isAleoInstalled) {
                installAleo();
            }
        } else {
          console.log('Installation skipped.');
        }
        rl.close();
      });
    }
}