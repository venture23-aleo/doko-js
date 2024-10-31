import React, { useState } from 'react';
import { Layout, Menu, Typography, Button, Space, Row, Col, Card, theme, ConfigProvider, Divider } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

import './Homepage.css';
import { Link } from 'react-router-dom';


const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const FEATURE_LIST = [{
    title: "Optimized Performance",
    description: "DokoJs is designed to be lightweight and highly performant, providing a robust foundation without compromising speed."
}, {
    title: "Comprehensive Toolset",
    description: "Integrates seamlessly with Aleo tools like Provable SDK, SnarkOS, and Leo, offering a full toolkit for blockchain testing."
}, {
    title: "Developer-Friendly Interface",
    description: "Designed with developers in mind, DokoJs makes complex interactions simple and accessible with an intuitive API."
}]

const colProps = {
    xl: { span: 8 },
    lg: {
        span: 12
    },
    md: { span: 16 },
    sm: { span: 20 },
    xs: { span: 24 }
}

const HomePage: React.FC = () => {
    const [isDarkMode] = useState(true);

    return (
        <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>

            <Layout className={`layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                {/* Header */}
                <Header style={{ backgroundColor: '#111111', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={1} style={{ color: '#fff', margin: 10 }}>DokoJS</Title>
                    </div>
                </Header>

                {/* Content */}
                <Content className='content' style={{
                    maxWidth: "1200px",
                    margin: "auto",
                    padding: '2rem 4rem'
                }}>
                    <div id='about'>
                        <Title style={{ fontSize: "5em" }} level={1}>DokoJS - Powerful and Lightweight</Title>
                        <Paragraph className="description">
                            DokoJS is a testing tool that enables easy interaction with the Aleo blockchain.
                            Its powerful toolkit simplifies development, integrating seamlessly with Provable SDK, SnarkOS, and Leo.
                        </Paragraph>
                        <div className="cta-buttons">
                            <Link
                                to="https://github.com/venture23-aleo/doko-js?tab=readme-ov-file#dokojs-developer-guide"
                                target='_blank'
                                referrerPolicy="no-referrer"
                            >
                                <Button style={{
                                    width: 200,
                                    height: 50
                                }} type="primary" size="large">Get Started</Button>
                            </Link>
                            <Link to="/demo">
                                <Button style={{
                                    width: 200,
                                    height: 50
                                }} type="default" size="large">Quick Demo</Button>
                            </Link>
                        </div>
                        <Link style={{
                            textDecoration: "none !important",
                            color: "white",
                            fontSize: "2rem"
                        }} to="https://github.com/venture23-aleo/doko-js" target="_blank" rel="noopener noreferrer">
                            <GithubOutlined />
                        </Link>
                    </div>

                    {/* Features Section */}
                    <Space direction='vertical' size="large">
                        <div className="features" id="features" style={{
                            padding: '2rem 4rem'
                        }}>
                            <Title level={1}>Features</Title>
                            <Divider />
                            <Row gutter={[16, 16]} justify="center">
                                {FEATURE_LIST.map(feature => (
                                    <Col {...colProps}>
                                        <Card title={feature.title} bordered={false}>
                                            <Paragraph className='feat-description'>
                                                {feature.description}
                                            </Paragraph>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Space>

                    {/* Documentation Section */}
                    <div id="docs" style={{ marginBottom: '2rem', padding: '2rem 4rem' }}>
                        <Title level={1}>Documentation</Title>
                        <Divider />
                        <Paragraph style={{ fontSize: "1.5rem" }}>
                            Get started quickly with our detailed documentation, which covers everything from initial setup to advanced usage examples.
                            <br />Visit our <a href="https://github.com/venture23-aleo/doko-js" target="_blank" rel="noopener noreferrer">GitHub repository</a> for the full guide.
                        </Paragraph>
                    </div>
                </Content>

                {/* Footer */}
                <Footer style={{ textAlign: 'center' }}>
                    <Space>
                        <a href="#about">About</a>
                        <a href="#features">Features</a>
                        <a href="https://github.com/venture23-aleo/doko-js" target="_blank" rel="noopener noreferrer">
                            <GithubOutlined />
                        </a>
                    </Space>
                    <Paragraph style={{ marginTop: '1rem' }}>©2024</Paragraph>
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default HomePage;
