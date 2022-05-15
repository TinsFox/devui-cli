const camelizeRE = /-(\w)/g;
const pascalizeRE = /(\w)(\w*)/g;
export function camelize(str: string): string {
  return str.replace(camelizeRE, (_, c) => c.toUpperCase());
}

export function pascalize(str: string): string {
  return camelize(str).replace(
    pascalizeRE,
    (_, c1, c2) => c1.toUpperCase() + c2
  );
}
export function formatName(component: string, lang?: string) {
  component = pascalize(component);
  if (lang) {
    return `${component}_${lang.replace("-", "_")}`;
  }
  return component;
}
/* HTML title */
export function getTitle(config: { title: string; description?: string }) {
  let { title } = config;

  if (config.description) {
    title += ` - ${config.description}`;
  }

  return title;
}
/* HTML meta */
export function getHTMLMeta(siteConfig: any) {
  const meta = siteConfig.site?.htmlMeta;
  if (meta) {
    return Object.keys(meta)
      .map((key) => `<meta name="${key}" content="${meta[key]}">`)
      .join("\n");
  }
  return "";
}
