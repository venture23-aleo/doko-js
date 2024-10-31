import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Divider, Form, Input, Select } from "antd";
import { CopyButton } from "../../components/Shared/CopyButton";
import { useAleoWASM, useDokoJsWASM } from "../../hooks/useDokoJSWASM";

const ALGORITHMS = [
    "bhp256",
    "bhp512",
    "bhp768",
    "bhp1024",
    "keccak256",
    "keccak384",
    "keccak512",
    "ped64",
    "ped128",
    "sha3_256",
    "sha3_384",
    "sha3_512"
];
const OUTPUTS = [
    "address",
    "boolean",
    "field",
    "group",
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "scalar"
]

export const HashMessage = () => {
    const [message, setMessage] = useState("");
    const [algorithm, setAlgorithm] = useState(null);
    const [outputType, setOutputType] = useState(null);
    const [hashedMessage, setHashedMessage] = useState("");
    const [dokoJsWasm] = useDokoJsWASM();

    const hashString = () => {
        if (!message || !algorithm || !outputType || !dokoJsWasm) {
            setHashedMessage("");
            return;
        };
        try {
            const hash = dokoJsWasm.Hasher.hash(algorithm, message, outputType, "testnet");
            const hash2 = dokoJsWasm.Hasher.hash(algorithm, message, outputType, "mainnet");
            console.log(hash, hash2)
            setHashedMessage(hash);
        } catch (e) {
            console.error(e);
        }
    };

    const onMessageChange = (event) => {
        setMessage(event.target.value);
    };

    const layout = { labelCol: { span: 4 }, wrapperCol: { span: 21 } };

    const onAlgorithmSelect = (value) => {
        console.log(value)
        setAlgorithm(value)
    }

    const onOutPutSelect = (value) => {
        setOutputType(value)
    }

    const populateForm = () => {
        setAlgorithm("bhp256")
        setMessage("{arr: [1u8, 1u8], size: 2u8}");
        setOutputType("field")
    }

    useEffect(() => {
        hashString();
    }, [algorithm, message, outputType])

    if (dokoJsWasm !== null) {
        return (
            <div className="container">
                <Card
                    title="Hash"
                    style={{ width: "100%" }}
                    extra={
                        <>
                            <Button
                                type="primary"
                                size="middle"
                                onClick={populateForm}
                            >
                                Show Demo
                            </Button>
                        </>
                    }
                >
                    <Form {...layout}>
                        <Form.Item label="Algorithm" colon={false}>
                            <Select
                                placeholder="Select Algorithm"
                                onChange={onAlgorithmSelect}
                                options={ALGORITHMS.map(alg => ({ label: alg, value: alg }))}
                                value={algorithm}
                            />
                        </Form.Item>
                        <Form.Item label="Message" colon={false}>
                            <Input
                                name="Message"
                                size="large"
                                placeholder="Message"
                                value={message}
                                allowClear={true}
                                onChange={onMessageChange}
                            />
                        </Form.Item>
                        <Form.Item label="Output Type" colon={false}>
                            <Select
                                placeholder="Select OutputType"
                                onChange={onOutPutSelect}
                                options={OUTPUTS.map(alg => ({ label: alg, value: alg }))}
                                value={outputType}
                            />
                        </Form.Item>
                    </Form>
                    {hashedMessage ? (
                        <Form {...layout}>
                            <Divider />
                            <Form.Item label="Hashed Message" colon={false}>
                                <Input
                                    size="large"
                                    placeholder="Signature"
                                    value={hashedMessage}
                                    addonAfter={
                                        <CopyButton data={hashedMessage} />
                                    }
                                    disabled
                                />
                            </Form.Item>
                        </Form>
                    ) : null}
                </Card>
            </div>
        );
    } else {
        return (
            <h3>
                <center>Loading...</center>
            </h3>
        );
    }
};
