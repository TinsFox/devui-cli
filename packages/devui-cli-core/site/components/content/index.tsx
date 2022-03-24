import './index.less'
import { Outlet } from "react-router-dom";
import { FC } from 'react'

const Content: FC = () => {
  return <div className="content">
    <div className="page">
      <Outlet/>
    </div>
  </div>
}
export default Content
