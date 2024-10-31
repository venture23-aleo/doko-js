import { useEffect, useState } from "react";
import { Button, Card, Col, Divider, Form, Input, Row, Skeleton } from "antd";
import { CopyButton } from "../../components/Shared/CopyButton";
import { useDokoJsWASM } from "../../hooks/useDokoJSWASM";
import "./DecryptRecord.css";
import { humanize } from "../../utils/humanize";

const DEFAULT_VALUES = {
    plainText: "",
    programName: "",
    methodName: "",
    inputIndex: "",
    privateKey: "",
    tpk: ""
}

export const EncryptRecord = () => {
    const [formValues, setFormValues] = useState(DEFAULT_VALUES)
    const [cipherText, setCipherText] = useState(null);
    const [_isOwner, setIsOwner] = useState(null);
    const [dokoJsWasm] = useDokoJsWASM();

    const onChange = (event) => {
        try {
            setFormValues(prevValues => ({ ...prevValues, [event.target.name]: event.target.value }));
            tryEncrypt();
        } catch (error) {
            console.error(error);
        }
    }

    const tryEncrypt = () => {
        setCipherText(null);
        const { privateKey, plainText, programName, methodName, inputIndex, tpk } = formValues;

        try {
            if (privateKey && plainText && programName && methodName && inputIndex && tpk) {
                const encryptedValue = dokoJsWasm.Encryter.get_encrypted_value(
                    plainText,
                    programName,
                    methodName,
                    inputIndex,
                    privateKey,
                    tpk,
                    "testnet"
                )
                setCipherText(
                    encryptedValue
                );
                setIsOwner(true);
            }
        } catch (error) {
            console.warn(error);

            if (cipherText !== null) {
                setCipherText(null);
            }
        }
    };

    useEffect(() => {
        tryEncrypt();
    }, [formValues])

    const populateForm = async () => {
        setFormValues({
            plainText: "3u32",
            programName: "types_test.aleo",
            methodName: "sum",
            inputIndex: 2,
            privateKey: "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH",
            tpk: "4894085870840878070008938887517642593787940398952348563490477594935969679255group"
        })

        tryEncrypt();
    };

    const clearForm = async () => {
        setFormValues(DEFAULT_VALUES)
        setCipherText(null);
        setIsOwner(null);
    };

    const layout = { labelCol: { span: 4 }, wrapperCol: { span: 21 } };

    if (dokoJsWasm !== null) {
        return (
            <div className="container">
                <Card
                    title="Encrypt Data"
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
                        {Object.keys(formValues).map(v => (
                            <Form.Item style={{
                                textTransform: "capitalize"
                            }} label={humanize(v)} colon={false}>
                                <Input
                                    key={v}
                                    name={v}
                                    size="large"
                                    placeholder={`Input ${v}`}
                                    allowClear
                                    onChange={onChange}
                                    value={formValues[v]}
                                />
                            </Form.Item>
                        ))}
                    </Form>
                    {Object.values(formValues).some(Boolean) ? (
                        <Row justify="center">
                            <Col>
                                <Button size="middle" onClick={clearForm}>
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    ) : null}
                    {
                        cipherText ? <Form {...layout}>
                            <Divider />
                            <Form.Item label="Encrypted Value" colon={false}>

                                <Row align="middle">
                                    <Col span={23}>
                                        <Input.TextArea
                                            size="large"
                                            rows={4}
                                            placeholder="Encrypted Value"
                                            value={cipherText}
                                            disabled
                                        />
                                    </Col>
                                    <Col span={1} align="middle">
                                        <CopyButton
                                            data={cipherText}
                                        />
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Form> : null
                    }
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
