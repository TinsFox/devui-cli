import './index.less';
import { Outlet } from "react-router-dom";
import Header from "../Header";
import SiderMenu from "../SiderMenu";
import Content from "../content";
import SlugNav from "../SlugNav";
import Footer from "../footer";
import * as React from "react";

export default function Layout() {
  return <div className="layout">
    <Header/>
    <div className="main">
      <div className="center">
        {/*左侧菜单*/}
        <SiderMenu/>
        {/*内容区*/}
        <Content>
          <Outlet/>
        </Content>
        {/*锚点目录*/}
        <SlugNav/>
      </div>
      <Footer/>
    </div>
  </div>
}
