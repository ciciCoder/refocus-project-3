/**
 * @typedef {Object} Ref
 * @property {any} value
 */
/**
 * Description
 * @param {Proxy} proxy
 * @returns {object|Array}
 */
const ref = (function () {
  /**
   * Description
   * @typedef {Object} GetTemplateResult
   * @property {string} templateHTML
   * @property {Element} container
   *
   * @param {string} templateId
   * @returns {GetTemplateResult}
   */
  function getTemplate(selector) {
    const template = document.querySelector(selector);
    const container = template.parentNode;
    const templateHTML = template.innerHTML;
    return { templateHTML, container };
  }

  /**
   * Description
   * @param {{Object.<string, any>}} variables
   * @param {string} templateHTML
   * @param {Element} container
   * @returns {void}
   */
  function renderMustach(variables, templateHTML, container) {
    const html = Mustache.render(templateHTML, variables);
    container.innerHTML = html;
  }

  /**
   * Description
   * @param {string} selector
   * @param {string} key
   * @param {object|Array} value
   * @returns {Proxy}
   */
  return (selector, key, value) => {
    const { container, templateHTML } = getTemplate(selector);
    const handler = {
      get(target, props) {
        const value = target[props];
        return value;
      },
      set(target, props, value) {
        const isArray = Array.isArray(target);
        target[props] = value;
        if (props === 'length' && isArray && !isNaN(value)) {
          console.log(props);
          target.forEach((item, index) => {
            target[index] = { ...item, __index: index };
          });
        }
        const data = {
          [key]: isArray ? [...target] : target.value,
        };
        console.log(data);
        renderMustach(data, templateHTML, container);
        return true;
      },
      apply(target, thisArg, args) {
        console.log('test');
        console.log(target, thisArg, args);
        return target(...args);
      },
    };
    const targetValue = value.map((item, idx) =>
      typeof item === 'object' ? { __index: idx, ...item } : item
    );
    const proxyTarget = {
      value: Array.isArray(value) ? new Proxy(targetValue, handler) : value,
    };
    const proxy = new Proxy(proxyTarget, handler);
    renderMustach({ [key]: targetValue }, templateHTML, container);
    return proxy;
  };
})();
