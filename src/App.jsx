import React from 'react';
import Events from './pages/Events.jsx';
import { Layout, Menu } from 'antd';
import {
  NotificationOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import './App.less';
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Link,
} from 'react-router-dom';
import { siteTitle } from './state/GlobalState.js';

const { Header, Sider } = Layout;
const topBarMenuitems = [
  {
    label: (
      <Link
        to="http://megamu.net/py0y"
        target="_blank"
        rel="noopener noreferrer"
      >
        MEGAMU
      </Link>
    ),
    key: 'home',
  },
];

const menuItems = [
  {
    label: 'Notificações',
    key: '1',
    icon: <NotificationOutlined />,
  },
  {
    label: 'Alerta Reset',
    key: '2',
    icon: <SyncOutlined />,
  },
  {
    label: 'Configurações',
    key: '3',
    icon: <SettingOutlined />,
    disabled: true,
    title: 'Em Breve',
    children: [
      {
        label: 'Configurações',
        key: '3-1',
      },
    ],
  },
];
function App() {
  return (
    <Layout>
      <Router>
        <Header style={{ backgroundColor: '#001529' }}>
          <div className="logo">
            {siteTitle.use()}
            <sup>(beta)</sup>
          </div>
          <Menu
            mode="horizontal"
            theme="dark"
            style={{ float: 'right' }}
            items={topBarMenuitems}
          />
        </Header>
        <Layout>
          <Sider width={200} className="site-layout-background">
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              // defaultOpenKeys={["sub1"]}
              style={{ height: '100%', borderRight: 0 }}
              items={menuItems}
            />
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Routes>
              <Route
                key="1"
                path="/"
                element={<Events pageTitle="Alerta de eventos" />}
                // element={<p>Home</p>}
              />
              <Route path="/resets" />
              <Route
                key="2"
                path="/resets"
                element={<p>Alerta de resets</p>}
              ></Route>
            </Routes>
          </Layout>
        </Layout>
      </Router>
    </Layout>
  );
}

export default App;
