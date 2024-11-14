import React from 'react';
import Events from './pages/events/Events';
import { Layout, Menu, FloatButton } from 'antd';
import {
  NotificationOutlined,
  SettingOutlined,
  SyncOutlined,
  UpCircleTwoTone,
  ExclamationOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import './App.less';
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Link,
} from 'react-router-dom';
import { siteTitle } from './state/GlobalState.js';
import Config from './pages/config/Config.tsx';
import GiveAway from './pages/giveaway/GiveAway';
const BackTop = FloatButton.BackTop;
const { Header, Sider } = Layout;

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
            style={{ float: 'right', minWidth: '100px' }}
            items={[
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
            ]}
          />
        </Header>
        <Layout>
          <Sider width={200} className="site-layout-background">
            <Menu
              mode="inline"
              defaultSelectedKeys={[location.pathname]}
              style={{ height: '100%', borderRight: 0 }}
              items={[
                {
                  label: <Link to="/">Eventos</Link>,
                  key: '/',
                  icon: <NotificationOutlined />,
                },
                {
                  label: 'Resets',
                  // label: <Link to="/resets">Resets</Link>,
                  disabled: true,
                  key: '/resets',
                  icon: <SyncOutlined />,
                },
                {
                  label: 'Boss',
                  // label: <Link to="/boss">Boss</Link>,
                  disabled: true,
                  key: '/boss',
                  icon: <SmileOutlined />,
                },

                {
                  label: 'Sorteio',
                  // label: <Link to="/sorteio">Sorteio</Link>,
                  disabled: true,
                  key: '/sorteio',
                  icon: <ExclamationOutlined />,
                },
                {
                  label: (
                    <Link to="/configuracoes">Configurações</Link>
                  ),
                  key: '/configuracoes',
                  icon: <SettingOutlined />,
                },
              ]}
            />
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Routes>
              <Route
                key="/"
                path="/"
                element={<Events pageTitle="Eventos" />}
              />
              <Route
                key="/resets"
                path="/resets"
                element={<p>Alerta de resets</p>}
              ></Route>
              <Route
                key="/sorteio"
                path="/sorteio"
                element={<GiveAway pageTitle="Sorteios" />}
              ></Route>
              <Route
                key="/configuracoes"
                path="/configuracoes"
                element={<Config pageTitle="Configurações" />}
              ></Route>
            </Routes>
          </Layout>
        </Layout>
      </Router>
      <BackTop
        icon={<UpCircleTwoTone />}
        shape="square"
        type="primary"
      />
    </Layout>
  );
}

export default App;
