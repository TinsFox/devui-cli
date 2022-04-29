import "./index.less";
import { NavLink } from "react-router-dom";
const NavLinkList = [
  {
    name: "设计规范",
    url: "",
  },
  {
    name: "组件",
    url: "",
  },
  {
    name: "图标库",
    url: "",
  },
  {
    name: "主题",
    url: "",
  },
];
export default function Header() {
  return (
    <div className="header">
      <a href="" className="logo">
        <img src="https://vue-devui.github.io/assets/logo.svg" alt="logo" />
        DevUI
      </a>

      {/* TODO 菜单通过配置注入 */}
      <ul className="menu">
        {NavLinkList.map((item) => (
          <li key={item.name}>
            <NavLink to={item.url}>{item.name}</NavLink>
          </li>
        ))}
        <li>
          <NavLink to="">English</NavLink>
        </li>
      </ul>
    </div>
  );
}
