"use client";
import { Collapse, Layout, theme, Tooltip } from 'antd';

import { MultiTabEditor } from './CodeEditor';
import { FileExplorer } from "./Explorer"
import { EditorContextProvider, useEditorContext } from './contexts';
import { useMemo } from 'react';
import { INode } from 'react-accessible-treeview';
import CodeInputModal from '../Modal/CodeInputModal';
import { PlaySquareOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;

export const IDEWithExplorer = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const { inputs, outputs, activeElement, compileAleoPrograms } = useEditorContext()
    const onCompile = (e) => {
        e.stopPropagation();
        compileAleoPrograms();
    }

    const getSelectedIds = (activeElement: INode | null, type: string) => {
        if (activeElement?.metadata?.type == type) {
            return [activeElement.id]
        }

        return [];
    };

    const items = useMemo(() => (typeof window === "undefined") ? [] : [
        {
            key: '1',
            label: <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>INPUTS <CodeInputModal /></div>,
            styles: {
                body: { padding: 0 },
                header: { background: "#242322", display: "flex", alignItems: "center" }
            },
            children: <FileExplorer data={inputs} selectedIds={getSelectedIds(activeElement, "input")} />,
        },
        {
            key: '2',
            label: (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    OUTPUTS
                    <Tooltip title="Run compile">
                        <PlaySquareOutlined onClick={onCompile} />
                    </Tooltip>
                </div>
            ),
            styles: {
                body: { padding: 0 },
                header: { background: "#242322" }
            },
            children: <FileExplorer data={outputs} selectedIds={getSelectedIds(activeElement, "output")} />,
        },
    ], [inputs, outputs, activeElement])

    return (
        <Layout style={{
            width: "100%",
            position: "relative"
        }}>
            <Sider
                className='main-app-sidebar editor-sidebar'
                style={{ background: "#242322" }}
                breakpoint="lg"
                collapsedWidth="0"
                width={256}
                onBreakpoint={(broken) => {
                    console.log(broken);
                }}
                onCollapse={(collapsed, type) => {
                    console.log(collapsed, type);
                }}
            >
                <div style={{ padding: "0.5em 1em" }}>
                    Explorer
                </div>
                <Collapse
                    style={{
                        padding: 0,
                        border: "none"
                    }}
                    items={items}
                    defaultActiveKey={"1"}
                />
            </Sider>
            <Layout>
                <Content>
                    <div
                        style={{
                            minHeight: 360,
                            background: colorBgContainer,
                        }}
                    >
                        <MultiTabEditor />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export const DokoIDE = () => <EditorContextProvider>
    <IDEWithExplorer />
</EditorContextProvider>
