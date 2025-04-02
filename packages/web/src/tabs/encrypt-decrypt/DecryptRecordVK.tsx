import { useEffect, useState } from "react";
import { Button, Card, Col, Divider, Form, Input, Row, Skeleton } from "antd";
import { CopyButton } from "../../components/Shared/CopyButton";
import { useDokoJsWASM } from "../../hooks/useDokoJSWASM";
import "./DecryptRecord.css";
import { humanize } from "../../utils/humanize";

const DEFAULT_VALUES = {
    cipherText: "",
    programName: "",
    methodName: "",
    inputIndex: "",
    viewKey: "",
    tpk: ""
}

export const DecryptRecordVK = () => {
    const [formValues, setFormValues] = useState(DEFAULT_VALUES)
    const [plaintext, setPlaintext] = useState(null);
    const [_isOwner, setIsOwner] = useState(null);
    const [dokoJsWasm] = useDokoJsWASM();

    const onChange = (event) => {
        try {
            setFormValues(prevValues => ({ ...prevValues, [event.target.name]: event.target.value }));
            tryDecrypt();
        } catch (error) {
            console.error(error);
        }
    }

    const tryDecrypt = () => {
        setPlaintext(null);
        const { viewKey, cipherText, programName, methodName, inputIndex, tpk } = formValues;

        try {
            if (viewKey && cipherText && programName && methodName && inputIndex && tpk) {
                console.log("Decrypting...", Object.keys(dokoJsWasm.Decrypter));
                const decryptedValue = dokoJsWasm.Decrypter.get_decrypted_value_using_view_key(
                    cipherText,
                    programName,
                    methodName,
                    inputIndex,
                    viewKey,
                    tpk,
                    "testnet"
                )

                setPlaintext(
                    decryptedValue
                );
                setIsOwner(true);
            }
        } catch (error) {
            console.warn(error);

            if (plaintext !== null) {
                setPlaintext(null);
            }
        }
    };

    useEffect(() => {
        tryDecrypt();
    }, [formValues])

    const populateForm = async () => {
        setFormValues({
            cipherText: "ciphertext1qyqv5fj8jc4enpvl8xdkxllvdhxe49qz3mn72xmr574ve5n4qtuawpgs4egw3",
            programName: "types_test.aleo",
            methodName: "sum",
            inputIndex: 2,
            viewKey: "AViewKey1mSnpFFC8Mj4fXbK5YiWgZ3mjiV8CxA79bYNa8ymUpTrw",
            tpk: "4894085870840878070008938887517642593787940398952348563490477594935969679255group"
        })

        tryDecrypt();
    };

    const clearForm = async () => {
        setFormValues(DEFAULT_VALUES)
        setPlaintext(null);
        setIsOwner(null);
    };

    const layout = { labelCol: { span: 4 }, wrapperCol: { span: 21 } };

    if (dokoJsWasm !== null) {
        return (
            <div className="container">
                <Card
                    title="Decrypt Data (View Key)"
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
                    {plaintext ?
                        <Form {...layout}>
                            <Divider />
                            <Form.Item label="Decrypted Value" colon={false}>
                                <Row align="middle">
                                    <Col span={23}>
                                        <Input.TextArea
                                            size="large"
                                            rows={4}
                                            placeholder="Decrypted Value"
                                            value={plaintext}
                                            disabled
                                        />
                                    </Col>
                                    <Col span={1} align="middle">
                                        <CopyButton
                                            data={plaintext}
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
