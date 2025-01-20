import React, { useEffect, useState } from 'react';
import { Layout, Typography, Spin, ConfigProvider, theme, Menu } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';

import './Homepage.css';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph } = Typography;

type MarkdownNode = {
  type: 'heading';
  depth: 2;
  text: string;
};

const Docs: React.FC = () => {
  const [isDarkMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkdown = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/venture23-aleo/doko-js/refs/heads/docs/README.md'
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch README: ${response.statusText}`);
      }
      const text = await response.text();
      setMarkdownContent(text);
      extractHeadings(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const extractHeadings = (markdown: string) => {
    const headingRegex = /^##\s+(.*)$/gm;
    const matches = [...markdown.matchAll(headingRegex)].map(match => match[1]);
    setMenuItems(matches);
  };

  useEffect(() => {
    fetchMarkdown();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const markdownComponents = {
    h1: (props: { [key: string]: any }) => {
      const text = props.children || '';
      return <Title id={text.replace(/\s+/g, '-').toLowerCase()} level={1} style={{ marginTop: '32px' }} {...props} />;
    },
    h2: (props: { [key: string]: any }) => {
      const text = props.children || '';
      return <Title id={text.replace(/\s+/g, '-').toLowerCase()} level={2} style={{ marginTop: '28px' }} {...props} />;
    },
    h3: (props: { [key: string]: any }) => {
      const text = props.children || '';
      return <Title id={text.replace(/\s+/g, '-').toLowerCase()} level={3} style={{ marginTop: '24px' }} {...props} />;
    },
    code: (props: { [key: string]: any }) => (
      <code style={{ backgroundColor: '#2d2d2d', padding: '2px 4px', borderRadius: '4px', color: '#f8f8f2' }} {...props} />
    ),
    pre: (props: { [key: string]: any }) => (
      <pre style={{ backgroundColor: '#2d2d2d', padding: '12px', borderRadius: '6px', overflowX: 'auto', color: '#f8f8f2' }} {...props} />
    ),
  };

  return (
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Layout className={`layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <Header style={{ backgroundColor: '#111111', color: '#fff', position: 'fixed', width: '100%', zIndex: 1000, top: 0 }}>
          <Title level={1} style={{ color: '#fff', margin: 10, fontWeight: 'bold', fontSize: '28px' }}>DokoJS Developer Guide</Title>
        </Header>

        <Layout style={{ marginTop: '64px' }}>
          <Sider width={250} style={{ background: '#1f1f1f', padding: '10px', height: '100vh', position: 'fixed', overflowY: 'auto' }}>
            <div style={{ padding: '10px 20px', marginBottom: '10px' }}>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>Contents</Title>
            </div>
            <Menu
              mode="inline"
              style={{ background: '#1f1f1f', color: '#fff', border: 'none' }}
              items={menuItems.map((item, index) => ({
                key: index,
                label: item,
                onClick: () => scrollToSection(item.replace(/\s+/g, '-').toLowerCase()),
              }))}
            />
          </Sider>

          <Content style={{ marginLeft: '250px', maxWidth: '900px', padding: '20px', margin: '0 auto' }}>
            {loading ? (
              <Spin tip="Loading README...">
                <div style={{ minHeight: '100px' }} />
              </Spin>
            ) : error ? (
              <Paragraph style={{ color: 'red' }}>{error}</Paragraph>
            ) : (
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
            )}
          </Content>
        </Layout>

        <Footer style={{ textAlign: 'center' }}>
          <a href="https://github.com/venture23-aleo/doko-js" target="_blank" rel="noopener noreferrer">
            <GithubOutlined /> View on GitHub
          </a>
          <Paragraph style={{ marginTop: '1rem' }}>©2024</Paragraph>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default Docs;
