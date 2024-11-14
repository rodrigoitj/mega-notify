import React from 'react';
import { siteTitle } from '../../state/GlobalState.js';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Breadcrumb, Tabs } from 'antd';
import { Content } from 'antd/es/layout/layout.js';
import ConfigEvents from './ConfigEvents';

function Config(props: { pageTitle: string }) {
  const breadCrumbItems = [
    {
      title: siteTitle.get(),
    },
    {
      title: props.pageTitle,
    },
  ];
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{`${siteTitle.get()} - ${props.pageTitle}`}</title>
          <meta name="description" content={props.pageTitle} />
        </Helmet>
      </HelmetProvider>
      <Breadcrumb
        style={{ margin: '16px 0' }}
        items={breadCrumbItems}
      />
      <Content
        className="site-layout-background"
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
        }}
      >
        <Tabs
          defaultActiveKey="1"
          tabPosition="left"
          style={{ height: 220 }}
          items={[
            {
              label: `Eventos`,
              key: '1',
              children: <ConfigEvents />,
            },
            {
              label: `Resets`,
              key: '2',
              disabled: true,
            },
            {
              label: `Boss`,
              key: '3',
              disabled: true,
            },
          ]}
        />
      </Content>
    </>
  );
}
export default Config;
