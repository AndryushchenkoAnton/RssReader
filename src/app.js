import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import render from './render.js';
import resources from './locales/index.js';
import parse from './parser.js';

const allOrigins = (link) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`;
const addId = (list, index) => list.map((listEl) => listEl.reduce((acc, el) => {
  const name = el.nodeName;
  acc[name] = el.nodeText;
  return acc;
}, { index }));

const validation = (arrayOfLinks, inputValue) => {
  yup.setLocale({
    string: {
      url: 'validURL',
    },
    mixed: {
      notOneOf: 'alreadyExists',
    },
  });

  const schema = yup.string().url().notOneOf(arrayOfLinks);
  return schema.validate(inputValue);
};

export default () => {
  const state = {
    form: {
      lng: 'ru',
      valid: true,
      state: 'ready',
      error: null,
    },
    descLink: [],
    links: [],
    currentFeeds: [],
  };

  const form = document.querySelector('.rss-form');
  const watcher = onChange(state, render);
  const updateLink = (links, oldFeeds) => {
    const parsedData = links.map((link) => axios.get(allOrigins(link)/* .catch(() => []) */));
    const data = Promise.all(parsedData);
    data.then((resolve) => {
      const dataC = resolve.map((el) => parse(el.data.contents));
      const newFeeds = dataC.flatMap((feed, index) => addId(feed.feedsInfo, index + 1));
      const titleOld = oldFeeds.map((el) => el.title);
      const filteredFeeds = newFeeds.filter((feed) => !titleOld.includes(feed.title));
      if (filteredFeeds.length !== 0) {
        watcher.currentFeeds.push(...filteredFeeds);
        watcher.form.state = 'updating';
      }
    }).then(() => {
      setTimeout(() => {
        watcher.form.state = 'ready';
        return updateLink(state.links, state.currentFeeds);
      }, 5000);
    });
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const value = formData.get('url');
        validation(watcher.links, value)
          .then((result) => {
            watcher.form.valid = true;
            watcher.form.error = null;
            watcher.links.push(result);
            form.reset();
            return result;
          })
          .then((link) => {
            watcher.form.state = 'sending';
            return axios.get(allOrigins(link));
          })
          .then((response) => {
            if (response.status !== 200) {
              throw new Error(`netWorkError: ${response.status}`);
            }
            const parsedResponse = parse(response.data.contents);
            if (!parsedResponse) {
              throw new Error('parserError');
            }
            const { title, description, feedsInfo } = parsedResponse;
            watcher.descLink.push({ title, description });
            const indexed = addId(feedsInfo, watcher.links.length);
            watcher.currentFeeds.push(...indexed);
            updateLink(state.links, state.currentFeeds);
          })
          .catch((e) => {
            const message = i18nextInstance.t(e.message);
            watcher.form.valid = false;
            watcher.form.error = { type: e.name, message };
          });
      });
    });
};
