import React from 'react';
import { siteTitle } from '../../state/GlobalState.js';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Breadcrumb } from 'antd';
import { Content } from 'antd/es/layout/layout.js';
function GiveAway(props: { pageTitle: string }) {
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
      <Content className="site-content-background"></Content>
    </>
  );
}
export default GiveAway;
