import { ALEO_CONFIG, BASE_CONTRACT } from "../../../data";

interface IOutputData {
    programName: string;
    types: string;
    leo2js: string;
    js2leo: string;
    contractClass: string;
    transitions: string
}

interface IFormattedOutput {
    "types": any[]; "js2leo": any[], 'leo2js': any[], "transitions": any[], 'contractClass': any[]
}

export const parseOutputData = (datas: IOutputData[]) => {
    const data: IFormattedOutput = {
        "types": [], "js2leo": [], 'leo2js': [], "transitions": [], 'contractClass': []
    };

    const createElementData = (data: IOutputData, key: keyof IOutputData) => {
        if (!data[key]) return;

        return {
            name: `${data.programName}.ts`,
            metadata: { content: data[key] ?? '', type: "output", key }
        }
    }

    datas.forEach(dataElm => {
        Object.keys(data).forEach(key => {
            if (Array.isArray(data[key as keyof typeof data])) {
                const content = createElementData(dataElm, key as keyof IOutputData)
                if (content)
                    data[key as keyof typeof data].push(content)
            }
        })
    });

    const nodeChildren: any[] = [];
    ['js2leo', 'leo2js', 'types', 'transitions'].forEach(key => {
        const keyChilds = data[key as keyof typeof data]
        if (keyChilds.length) {
            nodeChildren.push({
                name: key,
                children: [...keyChilds]
            })
        }
    })

    return {
        name: "",
        children: [
            {
                name: "artifacts",
                children: [{
                    name: "js",
                    children: [
                        ...nodeChildren,
                        ...data.contractClass
                    ],
                }],
            },
            {
                name: "contract",
                children: [{
                    name: "base-contract.ts",
                    metadata: { content: BASE_CONTRACT, type: "output" }
                }]
            },
            {
                name: "aleo-config.js",
                metadata: { content: ALEO_CONFIG, type: "output" }
            }
        ],
    }
}