// plugin/util.js
const { compileTemplate, TemplateCompiler } = require('@vue/compiler-sfc')

export function stripScript(content: string) {
  const result = content.match(/<(script)>([\s\S]+)<\/\1>/)
  return result && result[2] ? result[2].trim() : ''
}

export  function stripStyle(content: string) {
  const result = content.match(/<(style)\s*>([\s\S]+)<\/\1>/)
  return result && result[2] ? result[2].trim() : ''
}

export  function stripTemplate(content: string) {
  content = content.trim()
  if (!content) {
    return content
  }
  return content.replace(/<(script|style)[\s\S]+<\/\1>/g, '').trim()
}

function pad(source: string) {
  return source
    .split(/\r?\n/)
    .map((line: any) => `  ${line}`)
    .join('\n')
}

const templateReplaceRegex = /<template>([\s\S]+)<\/template>/g
export  function genInlineComponentText(template: any, script: string, extendsScript: undefined) {
  let source = template
  if (templateReplaceRegex.test(source)) {
    source = source.replace(templateReplaceRegex, '$1')
  }
  const finalOptions = {
    source: `<div>${source}</div>`,
    filename: 'inline-component',
    compiler: TemplateCompiler,
    compilerOptions: {
      mode: 'function',
    },
  }

  // 利用Vue的底层工具将原始模板代码编译为渲染函数代码
  const compiled = compileTemplate(finalOptions)
  // tips
  if (compiled.tips && compiled.tips.length) {
    compiled.tips.forEach((tip: any) => {
      console.warn(tip)
    })
  }
  // errors
  if (compiled.errors && compiled.errors.length) {
    console.error(
      `\n  Error compiling template:\n${pad(compiled.source)}\n` +
        compiled.errors.map((e: any) => `  - ${e}`).join('\n') +
        '\n'
    )
  }
  let demoComponentContent = `
    ${compiled.code.replace('return function render', 'function render')}
  `
  script = script.trim()
  if (script) {
    script = script
      .replace(/export\s+default/, 'const democomponentExport =')
      .replace(/import ({.*}) from 'vue'/g, (s: any, s1: any) => `const ${s1} = Vue`)
  } else {
    script = 'const democomponentExport = {}'
  }

  // 最后导出一个自执行的渲染函数字符串
  demoComponentContent = `(function() {
    ${demoComponentContent}
    ${script}
    return {
      render,
      ...democomponentExport,
      ${extendsScript ? `extends: ${extendsScript},` : ''}
    }
  })()`
  return demoComponentContent
}


