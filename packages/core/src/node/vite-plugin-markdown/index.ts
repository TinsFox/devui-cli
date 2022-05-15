// plugin/index.js
import markdown from './markdown.js'
import { stripScript, stripTemplate, genInlineComponentText } from './util'

export default function vitePluginMarkdown(options = {}) {

    return {
        name: 'vitePluginMarkdown',
        enforce: 'pre',
        transform: function(code: any, id: string) {
            // 截取.md文件
            if (/\.md$/.test(id) === false) {
                return
            }
            // 将code转换成html内容，这里拿到的都是经过转换后的html代码，而.md所定义的组件内容都在 <!--component-demo: ... :component-demo--> 注释里面。
            const content = markdown.render(code)

            // 下面只要将注释里的内容转换成Vue组件就可以了。

            // 定义几个变量，用于解析内容
            const startTag = '<!--component-demo:'
            const startTagLen = startTag.length
            const endTag = ':component-demo-->'
            const endTagLen = endTag.length
            let output = [];            // 最后输出内容
            let componentId = 0;        // 组件id
            let start = 0;              // 字符串开始位置
            let pageScript = '';        // script标签
            let componentsString = '';  // 组件数据字符串


            // 查找是否具有组件内容
            let commentStart = content.indexOf(startTag);
            let commentEnd = content.indexOf(endTag)

            while(commentStart !== -1 && commentEnd !== -1) {
                // 将查找到组件之前的内容先添加进去
                output.push(content.slice(start, commentStart))

                // <!-- *** ---> 找到之间的内容
                const commentContent = content.slice(commentStart + startTagLen, commentEnd)

                // 去掉标签的内容
                const html = stripTemplate(commentContent)
                const script = stripScript(commentContent)
                // 通过vue将html模板和script标签解析成组件内容
                let demoComponentContent = genInlineComponentText(html, script)
                const demoComponentName = `component-demo-${componentId}`;

                output.push(`<template #source><${demoComponentName} /></template>`)
                componentsString += `${JSON.stringify(demoComponentName)}: ${demoComponentContent},`

                // 重新计算下一次的位置
                componentId++
                start = commentEnd + endTagLen
                commentStart = content.indexOf(startTag, start)
                commentEnd = content.indexOf(endTag, commentStart + startTagLen)
            }


            // 有组件数据则注册组件，
            if (componentsString) {
                pageScript = `<script lang="ts">
                    import * as Vue from 'vue';
                    export default Vue.defineComponent({
                        name: 'component-demo',
                        components: {
                            ${componentsString}
                        },
                    })
                </script>`
            }

            // 把剩下的内容一块加进去
            output.push(content.slice(start))
            const html = `
                    <template>
                        ${output.join('')}
                    </template>
                    ${pageScript}
                    `;

            // 把解析好的代码return出去
            return {
                code: html,
            };
        }
    }
}

