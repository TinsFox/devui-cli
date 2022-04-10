import "./index.less";

export default function Header() {
  return (
    <div className="header">
      <a href="" className="logo">
        <img src="https://vue-devui.github.io/assets/logo.svg" alt="logo" />
        DevUI
      </a>

      {/* TODO 菜单通过配置注入 */}
      <ul className="menu">
        <li>
          {/* TODO use react-router API to refactor instead of a */}
          <a href="/spec">设计规范</a>
        </li>
        <li>
          <a href="">组件</a>
        </li>
        <li>
          <a href="">图标库</a>
        </li>
        <li>
          <a href="">主题</a>
        </li>
        <li>
          <a href="">English</a>
        </li>
      </ul>
    </div>
  );
}
