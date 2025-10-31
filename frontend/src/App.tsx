import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Button, Space } from 'antd';
import { 
  LineChartOutlined, 
  UploadOutlined, 
  TableOutlined,
  BarChartOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import OperationsDashboard from './pages/OperationsDashboard';
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
          <Header style={{ background: '#001529', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px' }}>
            {/* 左侧：标题和导航 */}
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: 50 }}>
                运费公斤段分析系统
              </div>
              <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['/']}
                style={{ background: 'transparent', border: 'none', flex: 1 }}
              >
                <Menu.Item key="/" icon={<LineChartOutlined />}>
                  <Link to="/">运营分析</Link>
                </Menu.Item>
                <Menu.Item key="/multi-dimension" icon={<BarChartOutlined />}>
                  <Link to="/multi-dimension">多维度分析</Link>
                </Menu.Item>
                <Menu.Item key="/freight-report" icon={<FileTextOutlined />}>
                  <Link to="/freight-report">详细报表</Link>
                </Menu.Item>
              </Menu>
            </div>
            
            {/* 右侧：操作按钮 */}
            <Space size="middle">
              <Link to="/data-table">
                <Button type="primary" icon={<TableOutlined />} ghost>
                  查看底表
                </Button>
              </Link>
              <Link to="/upload">
                <Button type="primary" icon={<UploadOutlined />}>
                  上传数据
                </Button>
              </Link>
            </Space>
          </Header>
          <Content style={{ background: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<OperationsDashboard />} />
              <Route path="/upload" element={<Dashboard />} />
              <Route path="/data-table" element={<Dashboard />} />
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
