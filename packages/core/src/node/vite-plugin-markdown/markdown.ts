import hljs from 'highlight.js';
import container from 'markdown-it-container';
import { stripTemplate } from './util';

// 定义解析成Vue组件的容器，就是解析在.md文件里 :::demo ... ::: 的内容
function mdContainer(md: {
  use: (arg0: any, arg1: string, arg2: {
    // 验证规则，只有匹配成功才会执行
    validate(params: any): any; render(tokens: any, idx: any): string;
  }) => void;
}) {
  md.use(container, 'demo', {
    // 验证规则，只有匹配成功才会执行
    validate(params: string) {
      return params.trim().match(/^demo\s*(.*)$/)
    },
    render(tokens: { [x: string]: { content: string; }; }, idx: number) {
      // open 节点
      if (tokens[idx].nesting === 1) {
        // 获取demo后面一个token的内容，如：
        // ```html
        // (省略...)
        // ````
        const content = tokens[idx + 1].type === 'fence' ? tokens[idx + 1].content.trim() : '';
        console.log("content", content);

        // 组装成组件并返回
        // <demo-block> 是我自己定义的一个组件，具有两个插槽source 和 code。用于展示组件效果和代码。
        // <!--component-demo: ${content} :component-demo--> 就是后面用来解析成组件的内容
        return `<demo-block>
                    <!--component-demo: ${content} :component-demo-->
                    <template #code>
                `
      } else {
        // closing tag
        return '</template></demo-block>';
      }
    }
  })
}

// 定义一些配置，这里重点是highlight里面的转换
let markdown_config = {
  html: true,           // Enable HTML tags in source
  xhtmlOut: true,       // Use '/' to close single tags (<br />).
  breaks: true,         // Convert '\n' in paragraphs into <br>
  langPrefix: 'lang-',  // CSS language prefix for fenced blocks. Can be
  linkify: false,       // 自动识别url
  typographer: true,
  quotes: '“”‘’',
  highlight: function (str: string, lang: any) {
    // 匹配到模板类型
    if (lang && hljs.getLanguage(lang)) {
      try {
        // 这里实际上做的是将 html的标签内容用 <template> 包裹，用于代码的展示。
        let replaceStr = stripTemplate(str);
        let template = `<template>\n${replaceStr}\n</template>`;
        str = str.replace(replaceStr, template);
        return '<pre class="hljs"><code>' +
          hljs.highlight(lang, str, true).value +
          '</code></pre>';
      } catch (__) { }
    }
    return '<pre class="hljs"><code>' + markdown.utils.escapeHtml(str) + '</code></pre>';
  }
}

// markdown-it对象
let markdown = require('markdown-it')(markdown_config);
markdown.use(container).use(mdContainer)

// 导出该对象
export default markdown
