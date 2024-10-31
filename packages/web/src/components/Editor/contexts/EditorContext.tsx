import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios';
import { flattenTree, INode, NodeId } from 'react-accessible-treeview';
import { parseOutputData } from './utils';
import { App } from 'antd';
import { EDITOR_README } from '../../../data';

interface IEditorContext {
    inputs: INode[];
    outputs: INode[];
    activeElement: null | INode;
    onFileSelect: (data: INode) => void,
    openedTabs: INode[],
    onTabSelect: (node: INode) => void,
    onTabClose: (node: INode) => void,
    isTabActive: (node: INode) => boolean,
    getParentName: (node: INode) => string,
    onAddFile: (node: any) => void,
    onRemoveFile: (node: any) => void,
    compileAleoPrograms: () => void,
}

const EditorContext = React.createContext<IEditorContext>({
    inputs: [],
    outputs: [],
    activeElement: null,
    onFileSelect: (file: INode) => console.log("method not implemented"),
    openedTabs: [],
    onTabSelect: (node: INode) => console.log("method not implemented"),
    onTabClose: (node: INode) => console.log("method not implemented"),
    isTabActive: (node: INode) => false,
    getParentName: (node: INode) => "",
    onAddFile: (node: any) => console.log("method not implemented"),
    onRemoveFile: (node: any) => console.log("method not implemented"),
    compileAleoPrograms: () => console.log("method not implemented"),
});

const DEFAULT_INPUT_DATA = flattenTree({
    "name": "",
    "children": [
        {
            "name": "README.md",
            metadata: {
                "content": EDITOR_README,
                type: "input"
            }
        }
    ],
})


export const EditorContextProvider = ({ children }) => {
    const { message } = App.useApp();
    const [newTabId, setNewTabId] = useState<number>(2);
    const [activeId, setActiveId] = useState<string | null>(`1-input`);
    const [inputs, setInputs] = useState<INode[]>(DEFAULT_INPUT_DATA)

    const [outputs, setOutputs] = useState<INode[]>([])
    const [openedTabs, setOpenedTabs] = useState<INode[]>([DEFAULT_INPUT_DATA[1]]);

    const getDokoOutput = async (programs) => {
        try {
            const { data } = await axios.post('/api/parser', { programs })
            const folder = parseOutputData(data.programData);

            const flattenedData = flattenTree(folder);
            setOutputs(flattenedData)
        } catch (e) { }
    }

    /**UTILITY METHODS */
    const setActiveTabId = (tab: INode | null) => {
        if (tab) {
            const activeId = `${tab.id}-${tab?.metadata?.type}`

            setActiveId(activeId);
        }
        else
            setActiveId(null)
    }

    const isTabActive = (tab: INode) => {
        const [nodeId, type] = getActiveNodeData();

        return nodeId === tab.id && type == tab?.metadata?.type;
    }

    const getParentName = (node: INode): string => {
        const searchArr = node?.metadata?.type == "input" ? inputs : outputs;
        const parent = searchArr.find(arr => arr.id == node.parent);

        return parent?.name || (node?.metadata?.type || "") as string;
    }

    const getActiveNodeData = (): [number, string] => {
        let [nodeId, type] = (activeId || "").split("-");

        return [Number(nodeId), type]
    }

    /** EXPLORER ACTIONS */
    const onFileSelect = (selectedFileData: INode) => {
        if (isTabActive(selectedFileData)) return;

        const hasTabOpen = openedTabs.some(tab => tab.id == selectedFileData.id && tab.metadata.type === selectedFileData.metadata.type)
        if (!hasTabOpen) {
            setOpenedTabs(prevTabs => [...prevTabs, selectedFileData])
        }

        onTabSelect(selectedFileData)
    };

    /** EDITOR ACTIONS */
    const onTabSelect = (tab: INode) => {
        setActiveTabId(tab);
    }

    const onTabClose = (tab: INode) => {
        const { id: tabId } = tab
        const updatedOpenTabs = openedTabs.filter(tab => tab.id !== tabId)
        setOpenedTabs(updatedOpenTabs);

        if (isTabActive(tab) && updatedOpenTabs.length) {
            setActiveTabId(updatedOpenTabs[0])
        } else if (updatedOpenTabs.length === 0) {
            setActiveTabId(null);
        }
    }

    /** NEW FILE ACTION */
    const onAddFile = (programData) => {
        const inputsData = [...inputs];
        const newFileData = {
            "id": newTabId,
            "name": programData.name,
            "children": [],
            "parent": 0,
            metadata: {
                "content": programData.content,
                type: "input",
                user: true
            }
        }
        inputsData.push(newFileData);
        const rootData = inputsData.find(inpData => inpData.id === 0);
        rootData?.children.push(newTabId);
        setInputs(inputsData);
        onFileSelect(newFileData);
        setNewTabId(newTabId + 1);
        localStorage.setItem("inputs", JSON.stringify(inputsData))
    }

    const onRemoveFile = (tab: INode) => {
        if (tab.metadata.type !== "input") return;
        onTabClose(tab);

        let _inputs = JSON.parse(JSON.stringify(inputs)).filter(inp => inp.id !== tab.id).map(inp => {
            if (inp.children.includes(tab.id)) {
                inp.children = inp.children.filter(childId => childId !== tab.id)
            }

            return inp;
        });

        setInputs(_inputs)
        localStorage.setItem("inputs", JSON.stringify(_inputs))
    }

    const compileAleoPrograms = () => {
        const programs = [];
        inputs.forEach((input) => {
            if (input.name.endsWith(".aleo")) {
                programs.push(input.metadata.content);
            }
        });

        if (programs.length === 0) {
            return message.open({
                key: "aleoProgram",
                type: 'error',
                content: 'No programs found',
                duration: 2,
            });
        }

        getDokoOutput(programs);
    };


    // useEffect(() => {
    //     localStorage.setItem("inputs", JSON.stringify(inputs))
    // }, [inputs]);

    useEffect(() => {
        const inputs = localStorage.getItem("inputs");

        if (inputs) {
            setInputs(JSON.parse(inputs))
        }
    }, [])

    const activeElement: INode | null = useMemo(() => {
        if (activeId) {
            const [nodeId, type] = getActiveNodeData();
            const searchArr = type == "input" ? inputs : outputs;
            const elm = searchArr.find(output => output.id == nodeId);

            return elm || null;
        }

        return null;
    }, [activeId, openedTabs, inputs, outputs])

    return (
        <EditorContext.Provider value={{
            inputs,
            outputs,
            activeElement,
            onFileSelect,
            openedTabs,
            onTabSelect,
            onTabClose,
            isTabActive,
            getParentName,
            onAddFile,
            onRemoveFile,
            compileAleoPrograms
        }}>
            {children}
        </EditorContext.Provider>
    )
}

export const useEditorContext = () => {
    return { ...useContext(EditorContext) }
}
