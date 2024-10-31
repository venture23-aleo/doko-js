import { useEffect, useState } from "react";
import { App, ConfigProvider, Layout, Menu, Spin, Switch, theme } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
    CodeOutlined,
    LockOutlined,
    CalculatorOutlined,
    SunFilled,
    MoonFilled
} from "@ant-design/icons";

import { useDokoJsWASM } from "./hooks/useDokoJSWASM";

const { Content, Footer, Sider } = Layout;

const menuItems = [
    {
        label: <Link to="/encrypt-decrypt">Encrypt / Decrypt</Link>,
        key: "/encrypt-decrypt",
        icon: <LockOutlined />,
    },
    {
        label: <Link to="/hashing">Hashing</Link>,
        key: "/hashing",
        icon: <CalculatorOutlined />,
    },
    {
        label: <Link to="/demo">Demo</Link>,
        key: "/demo",
        icon: <CodeOutlined />,
    }
];
function Main() {
    const [menuIndex, setMenuIndex] = useState("demo");
    const [, loading] = useDokoJsWASM();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        setMenuIndex(location.pathname);
    }, [location, navigate]);

    const [darkMode, setDarkMode] = useState(true);
    if (loading)
        return (<div>
            Loading
        </div>)

    return (
        <ConfigProvider
            theme={{
                algorithm: darkMode
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
            }}
        >
            <App>
                <Layout style={{ minHeight: "100vh" }}>
                    <Sider breakpoint="lg" collapsedWidth="0" theme="light">
                        <h1 style={{ paddingLeft: "10px" }}>
                            <Link to="/">
                                DOKOJS
                            </Link>
                        </h1>
                        <Menu
                            theme="light"
                            mode="inline"
                            selectedKeys={[menuIndex]}
                            items={menuItems}
                        />
                        {/* <Switch
                            style={{
                                marginTop: "24px",
                                marginLeft: "24px",
                            }}
                            checked={darkMode}
                            onChange={(value) => setDarkMode(value)}
                            checkedChildren={<SunFilled />}
                            unCheckedChildren={<MoonFilled />}
                        /> */}
                    </Sider>
                    <Layout>
                        <Content style={{ padding: "50px 50px", margin: "0 auto", minWidth: "850px", width: "100%" }}>
                            <Outlet />
                        </Content>
                        <Footer style={{ textAlign: "center", display: "flex", flexDirection: "column" }} />
                    </Layout>
                </Layout>
            </App>
        </ConfigProvider>
    );
}

export default Main;
