# devui-cli

`devui-cli`

## 环境准备

- node >= 12.0
- pnpm >= 6.21.0

> 项目目前约束仅使用 [pnpm](https://pnpm.io/zh/) 作为包管理器，请确保环境中存在 `pnpm`再尝试运行本项目

## 项目结构

### devui-cli-core

```
.
├── README.md
├── bin
│   ├── devui-cli.js
│   └── openChrome.applescript
├── package.json
├── rollup.config.js
├── site
│   ├── components
│   │   ├── Header
│   │   ├── SiderMenu
│   │   ├── SlugNav
│   │   ├── container
│   │   ├── content
│   │   ├── footer
│   │   ├── layout
│   │   └── typings.d.ts
│   ├── index.html
│   ├── src
│   │   ├── App.css
│   │   ├── README.md
│   │   ├── main.tsx
│   │   ├── pages
│   │   ├── routes.tsx
│   │   └── vite-env.d.ts
│   └── style
│       ├── base.less
│       └── font.less
├── src
│   └── node
│       ├── cli.ts
│       ├── config.ts
│       ├── constants.ts
│       ├── index.ts
│       ├── logger.ts
│       ├── server
│       ├── tsconfig.json
│       └── utils.ts
└── tsconfig.base.json
```

### docs-test，devui-cli-core 测试工程

```
.
├── README.md
├── devui.config.ts
├── docs
│   └── markdown # 站点文档，贡献指南 快速上手等
├── package.json
├── src
│   ├── action-bar      # 组件目录
│   │   └── README.md   # 组件文档
│   └── button
│       └── README.md
└── text.txt
```

## 开发

```bash
# 安装依赖
pnpm install

# 运行cli dev
pnpm dev --filter @devui/devui-cli
# 运行cli 站点构建
pnpm dev --filter @devui/cli-test
```
