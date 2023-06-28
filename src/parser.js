export default (data) => {
  const parserDOM = new DOMParser();
  const parsedData = parserDOM.parseFromString(data, 'application/xml');
  const error = parsedData.querySelector('parsererror');

  if (error) {
    const e = new Error('parseError');
    e.name = 'parseError';
    throw (e);
  }

  const document = parsedData.documentElement;
  const docFirstChild = document.children[0];
  const elements = Array.from(docFirstChild.children).filter((child) => child.nodeType !== 3);
  const [title, description] = elements;

  const feedsInfo = elements.filter((node) => node.nodeName === 'item')
    .map((nodeItem) => {
      const children = Array.from(nodeItem.childNodes)
        .filter((el) => el.nodeType !== 3);

      return children.map((childEl) => {
        const { nodeName } = childEl;
        const nodeText = childEl.textContent;
        return { nodeName, nodeText };
      });
    });

  return { title, description, feedsInfo };
};
