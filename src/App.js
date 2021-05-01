import React, { useContext } from 'react';
import Events from './pages/Events';
import { Layout, Menu } from 'antd';
import {
  NotificationOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import './App.less';
import {
  Switch,
  Route,
  BrowserRouter as Router,
  Link,
} from 'react-router-dom';
import GlobalContext from './context/GlobalContext';

const { Header, Sider } = Layout;

function App() {
  const { siteTitle } = useContext(GlobalContext);
  return (
    <Layout>
      <Router>
        <Header style={{ backgroundColor: '#001529' }}>
          <div className="logo">
            {siteTitle}
            <sup>(beta)</sup>
          </div>
          <Menu
            mode="horizontal"
            theme="dark"
            style={{ float: 'right' }}
          >
            <Menu.Item key="1">
              <a
                href="http://megamu.net/py0y"
                target="_blank"
                rel="noopener noreferrer"
              >
                MEGAMU
              </a>
            </Menu.Item>
          </Menu>
        </Header>
        <Layout>
          <Sider width={200} className="site-layout-background">
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              // defaultOpenKeys={["sub1"]}
              style={{ height: '100%', borderRight: 0 }}
            >
              <Menu.Item key="1" icon={<NotificationOutlined />}>
                <Link to="/">Notificações</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<SyncOutlined />}>
                <Link to="/resets">Alerta Reset</Link>
              </Menu.Item>
              <Menu.Item
                key="3"
                icon={<SettingOutlined />}
                disabled={true}
                title="Em Breve"
              >
                Configurações
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Switch>
              <Route path="/" key="1" exact={true}>
                <Events pageTitle="Alerta de eventos"></Events>
              </Route>
              <Route path="/resets" key="2" exact={true}>
                <p>Alerta de resets</p>
              </Route>
            </Switch>
          </Layout>
        </Layout>
      </Router>
    </Layout>
  );
}

export default App;
