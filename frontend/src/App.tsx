import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ConfigProvider, Layout, Menu } from 'antd';
import { DashboardOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import Dashboard from './pages/Dashboard';
import MultiDimensionAnalysis from './pages/MultiDimensionAnalysis';
import FreightAnalysisReport from './pages/FreightAnalysisReport';
import 'dayjs/locale/zh-cn';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ background: '#001529' }}>
            <div style={{ color: 'white', float: 'left', fontSize: 20, fontWeight: 'bold', marginRight: 50 }}>
              运费公斤段分析系统
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['/']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="/" icon={<DashboardOutlined />}>
                <Link to="/">数据概览</Link>
              </Menu.Item>
              <Menu.Item key="/multi-dimension" icon={<BarChartOutlined />}>
                <Link to="/multi-dimension">多维度分析</Link>
              </Menu.Item>
              <Menu.Item key="/freight-report" icon={<FileTextOutlined />}>
                <Link to="/freight-report">运费分析报表</Link>
              </Menu.Item>
            </Menu>
          </Header>
          <Content style={{ background: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/multi-dimension" element={<MultiDimensionAnalysis />} />
              <Route path="/freight-report" element={<FreightAnalysisReport />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;
