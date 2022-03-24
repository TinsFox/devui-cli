import './index.less'
import { FC } from "react";

interface ISiderMenu {
  menu?: Array<any>
}

const SiderMenu: FC<ISiderMenu> = ({menu}) => {
  return <div className='nav'>
    1234
    {/*{nav.map((group) => (*/}
    {/*  <div key={group.title} className="nav__group">*/}
    {/*    <div className="nav__title">{group.title}</div>*/}
    {/*    {group.items &&*/}
    {/*      group.items.map((item) => (*/}
    {/*        <div key={item.title} className="nav__item">*/}
    {/*          <div>{item.title}</div>*/}
    {/*        </div>*/}
    {/*      ))}*/}
    {/*  </div>*/}
    {/*))}*/}
  </div>
}
export default SiderMenu
