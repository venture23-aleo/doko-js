"use client";
import React, { useRef } from 'react';
import AceEditor from 'react-ace';
import { CloseOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ace";

import { useEditorContext } from './contexts';

import { FileIcon } from './Explorer/Utils';

import "./editor.css";

type Tab = {
    id: string;
    title: string;
    content: string;
    language: string;
};

interface DokoJSEditorProps {
    idx?: string
    name: string
    data: string,
    readOnly?: boolean
}

export const DokoJSEditor = ({
    name,
    data,
    readOnly
}: DokoJSEditorProps) => {
    const codeRef = useRef();

    return <>
        <div style={{ height: 10 }}></div>
        <AceEditor
            mode="javascript"
            //@ts-expect-error Incompatible type assigned
            ref={codeRef}
            width="100%"
            height='100%'
            theme="github_dark"
            name={`${name}-editor`}
            onCopy={(v) => {
                console.log(v)
            }}
            defaultValue={data}
            readOnly={readOnly}
            editorProps={{ $blockScrolling: true }} />
    </>;
}

export const MultiTabEditor: React.FC = () => {
    const { activeElement, openedTabs, onTabSelect, onTabClose, isTabActive, getParentName } = useEditorContext();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div className='editor-tabs-content' style={{ display: 'flex', flexWrap: "nowrap", borderBottom: '1px solid #ddd', overflow: "scroll" }}>
                {openedTabs.map((tab) => (
                    <Tooltip title={`../${getParentName(tab)}/${tab.name}`} arrow={false}>
                        <div
                            key={tab.id}
                            onClick={() => onTabSelect(tab)}
                            style={{
                                padding: '10px',
                                paddingRight: '20px',
                                minWidth: 150,
                                fontSize: 13,
                                cursor: 'pointer',
                                backgroundColor: isTabActive(tab) ? "#504644" : "#242322",
                                border: "1px solid black",
                                position: "relative",
                            }}
                        >

                            <div style={{ lineHeight: 1 }}>
                                <FileIcon filename={tab.name} />
                                <span style={{
                                    display: "inline-block",
                                    width: 100,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}>{tab.name}</span>
                            </div>
                            {tab.id != 1 && < CloseOutlined
                                height={10}
                                width={10}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTabClose(tab)
                                }}
                                style={{
                                    cursor: 'pointer',
                                    position: "absolute",
                                    right: 5,
                                    top: 0,
                                    bottom: 0,
                                }}
                            />}
                        </div>
                    </Tooltip>
                ))}
            </div>

            {activeElement && (
                <DokoJSEditor
                    key={`${activeElement.id}-${activeElement?.metadata?.content}`}
                    name={activeElement.name}
                    data={(activeElement?.metadata?.content || "") as string}
                    // readOnly={activeElement?.metadata?.type == "output"}
                    readOnly
                />
            )}
        </div>
    );
};
