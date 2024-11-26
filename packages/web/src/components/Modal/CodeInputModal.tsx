import { useState } from 'react';
import { Alert, Button, Modal, Tooltip } from 'antd';

import { Input } from 'antd';
import { useEditorContext } from '../Editor/contexts';
import { FileAddOutlined } from '@ant-design/icons';
import { SAMPLE_PROGRAM } from '../../data';

const { TextArea } = Input

const getFileName = (code: string) => {
    const regex = /program\s(\w+\.aleo)/gm;
    const data = regex.exec(code);

    return data?.[1] ?? "";
}

const PLACEHOLDER = SAMPLE_PROGRAM;

const CodeInputModal = () => {
    const { onAddFile, inputs } = useEditorContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputData, setInputData] = useState("");
    const [error, setError] = useState("");

    const showModal = (e) => {
        e.stopPropagation()
        setIsModalOpen(true);
    };

    const programExists = (programName) => {
        return inputs.some(inp => inp.name == programName)
    }

    const handleOk = (e) => {
        const programName = getFileName(inputData);
        if (!programName) {
            setError("Invalid code: Unable to retrieve program name")
            return;
        }

        if (programExists(programName)) {
            setError(`Error: Program ${programName} already exists`)
            return;
        }


        setIsModalOpen(false);

        onAddFile({
            name: programName,
            content: inputData
        });
    };

    const handleCancel = (e) => {
        e.stopPropagation()
        setInputData("");
        setError("");
        setIsModalOpen(false);
    };

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Add new file">
                <FileAddOutlined onClick={showModal} />
            </Tooltip>
            <Modal title="Enter Aleo OP Code" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
                footer={(_, { OkBtn, CancelBtn }) => (
                    <>
                        <Button onClick={() => {
                            setInputData(SAMPLE_PROGRAM)
                        }}>Add Sample</Button>
                        <CancelBtn />
                        <OkBtn />
                    </>
                )}
            >
                <TextArea value={inputData} onChange={(e) => {
                    setError("");
                    setInputData(e.target.value)
                }} placeholder={PLACEHOLDER} rows={10} />
                <Alert style={{ opacity: error ? 1 : 0 }} message={error} type="error" showIcon />
            </Modal>
        </div>
    );
};

export default CodeInputModal