# devui-cli Road Map
> devui-cli 开发规划

- [ ] 文档系统，暴露约定式配置读取markdown 文件，渲染文档
- [ ] 文档展示demo，在markdown 中 使用 :::demo 等代码块的方式，支持react组件库的demo展示
- [ ] 脱离react约束，暴露vue、ng组件库的demo展示，完全解耦应该是做不到的，因为要渲染某一个框架的demo，其载体还是基于那个框架会比较方便实现。
- [ ] 引入外部demo代码块，参照 [dumi](https://d.umijs.org/zh-CN/guide/basic#%E5%A4%96%E9%83%A8-demo) 实现，这样就可以解决在markdown中编写demo的问题了。
- [ ] eslint
- [ ] prettier
- [ ] stylelint
