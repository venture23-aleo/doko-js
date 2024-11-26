"use client";

import TreeView, { INode, ITreeViewOnNodeSelectProps, NodeId } from "react-accessible-treeview";
import { MenuProps, Tooltip } from "antd";
import { Dropdown } from 'antd';
import { useMemo } from "react";

import { FolderIcon, FileIcon } from "./Utils";
import { useEditorContext } from "../contexts";

import "./styles.css";

interface IFileExplorerProps {
    data: INode[],
    selectedIds: NodeId[]
}



const CustomContextMenu = ({ children, element, isBranch }) => {
    const { onFileSelect, onRemoveFile } = useEditorContext()

    const items: MenuProps['items'] = [
        {
            label: element.name,
            key: '1',
            disabled: true,
        },
        {
            key: '2',
            label: 'Open',
            onClick: () => onFileSelect(element)
        },
        {
            key: '3',
            label: 'Delete',
            onClick: () => onRemoveFile(element)
        },
    ];

    const renderItems = useMemo(() => {
        if (element?.metadata?.user) return items;

        return items.filter(item => item.key !== '3');

    }, [element?.metadata?.user])

    if (isBranch) return <>{children}</>

    return (
        <Dropdown menu={{ items: renderItems }} trigger={['contextMenu']}>
            {children}
        </Dropdown>
    );
};

export const FileExplorer = ({ data, selectedIds }: IFileExplorerProps) => {
    const { onFileSelect } = useEditorContext();

    const handleSelect = (nodeData: ITreeViewOnNodeSelectProps) => {
        if (nodeData.isBranch || !nodeData.isSelected) return;

        onFileSelect(nodeData.element)
    }

    if (!data.length) return null;

    return (
        <>
            <div className="ide">
                <TreeView
                    key={data.length.toString()}
                    data={data}
                    aria-label="directory tree"
                    togglableSelect
                    clickAction="EXCLUSIVE_SELECT"
                    // selectedIds={selectedIds}
                    expandedIds={data.map(d => d.id)}
                    onSelect={handleSelect}
                    nodeRenderer={({
                        element,
                        isBranch,
                        isExpanded,
                        getNodeProps,
                        level
                    }) => {
                        return (
                            <CustomContextMenu element={element} isBranch={isBranch}>
                                <div {...getNodeProps()} style={{
                                    paddingLeft: 20 * (level),
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    display: "flex",
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginRight: 5
                                    }}>
                                        {isBranch ? (
                                            <FolderIcon isOpen={isExpanded} />
                                        ) : (
                                            <FileIcon filename={element.name} />
                                        )}
                                    </div>
                                    <Tooltip overlayInnerStyle={{
                                        userSelect: "none"
                                    }} mouseEnterDelay={1} title={element.name} arrow={false}>
                                        <span>{element.name}</span>
                                    </Tooltip>
                                </div>
                            </CustomContextMenu>
                        )
                    }}
                />
            </div>
        </>
    );
}
