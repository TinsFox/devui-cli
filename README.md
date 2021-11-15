# devui-cli

`devui-cli`

## 环境准备

- node >= 12.0
- pnpm >= 6.21.0

> 项目目前约束仅使用 [pnpm](https://pnpm.io/zh/) 作为包管理器，请确保环境中存在 `pnpm`再尝试运行本项目

## 项目结构

```
packages
├── devui-cli
│    ├─ docs                    # cli 文档
│    ├─ lib                     # cli 构建产物
│    ├─ stie                    # 文档系统模板
│    └─ src                     # 组件入口
│       ├─ commands             # cli 命令集合
│       ├─ common               # 公共模块：常量、路径等
│       ├─ complier             # 编译相关：site、
│       ├─ config               # cli 配置
│       ├─ cli.ts               # cli 命令
│       ├─ index.ts             # cli 命令注册入口
│    ├─ bin.js                  # devui-cli 入口
│    ├─ package.json        
│    └─ READMEmd                # 中文文档
└─ docs-demo                    # cli 测试demo，组件库结构雏形
   ├─ docs                      # 站点入口文档
   ├─ src                       # 组件入口
   │   └─ action-bar            # cli 命令集合
   │       └─ README.zh-CN.md  # 中文文档
   ├─ devui.config.js           # devui-cli 配置
   └─ README.zh-CN.md           # 中文文档
```

## 开发

```bash
# 安装依赖
pnpm install

# 运行cli demo
pnpm docs:dev 
```
