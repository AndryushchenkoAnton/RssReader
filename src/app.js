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

const validation = (links, inputValue) => {
  const schema = yup.string().url().notOneOf(links);
  return schema.validate(inputValue);
};

export default () => {
  yup.setLocale({
    string: {
      url: 'validURL',
    },
    mixed: {
      notOneOf: 'alreadyExists',
    },
  });

  const state = {
    form: {
      lng: 'ru',
      valid: true,
      state: 'ready',
      error: { type: null },
    },
    descLink: [],
    links: [],
    currentFeeds: [],
    uiState: {
      readPosts: [],
      currentPost: null,
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: document.getElementById('modal'),
    submitB: document.body.querySelector('[aria-label = "add"]'),
    textInput: document.body.querySelector('#url-input'),
    feedbackP: document.body.querySelector('.feedback'),
  };

  const watcher = onChange(state, render(elements));
  const updateLink = (links, oldFeeds) => {
    const parsedData = links.map((link) => axios.get(allOrigins(link)));
    const data = Promise.all(parsedData);
    data.then((resolve) => {
      const dataC = resolve.map((el) => {
        const parsed = parse(el.data.contents);
        if (!parsed) {
          throw new Error();
        }
        return parsed;
      }).filter((dataF) => dataF !== false);
      const newFeeds = dataC.flatMap((feed, index) => addId(feed.feedsInfo, index + 1));
      const titleOld = oldFeeds.map((el) => el.title);
      const filteredFeeds = newFeeds.filter((feed) => !titleOld.includes(feed.title));
      if (filteredFeeds.length !== 0) {
        watcher.currentFeeds.push(...filteredFeeds);
        watcher.form.state = { name: 'updating' };
      }
    }).then(() => {
      setTimeout(() => {
        watcher.form.state = { name: 'ready' };
        return updateLink(state.links, state.currentFeeds);
      }, 5000);
    })
      .catch(() => []);
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const value = formData.get('url');
        validation(watcher.links, value)
          .then((result) => {
            watcher.form.valid = true;
            watcher.form.error = { type: null };

            return result;
          })
          .then((link) => {
            watcher.form.state = { name: 'sending' };

            return axios.get(allOrigins(link));
          })
          .then((response) => {
            console.log(response);
            watcher.form.state = { name: 'loaded' };
            if (response.status !== 200) {
              const e = new Error(`networkError: ${response.status}`);
              throw (e);
            }
            const parsedResponse = parse(response.data.contents);
            if (!parsedResponse) {
              const e = new Error('parseError');
              e.name = 'parseError';
              throw (e);
            }
            elements.form.reset();
            watcher.links.push(value);
            watcher.form.state = { name: 'success', message: i18nextInstance.t('success') };
            const { title, description, feedsInfo } = parsedResponse;
            watcher.descLink.push({ title, description });
            const indexed = addId(feedsInfo, watcher.links.length);
            watcher.currentFeeds.push(...indexed);
            const buttonsDesc = document.querySelectorAll('.btn-outline-primary');
            buttonsDesc.forEach((button) => {
              button.addEventListener('click', () => {
                const link = button.parentNode.querySelector('a');
                const post = state.currentFeeds.filter((feed) => feed.title === link.textContent);
                watcher.uiState.currentPost = post;
                watcher.uiState.readPosts.push({ post: post[post.length - 1], link });
              });
            });
          })
          .catch((e) => {
            if (e.name === 'ValidationError') {
              const message = i18nextInstance.t(e.message);
              watcher.form.valid = false;
              watcher.form.error = { type: e.name, message };
              return;
            }
            const message = i18nextInstance.t(e.name);
            watcher.form.valid = false;
            watcher.form.error = { type: e.name, message };
          });
      });
    });
  updateLink(state.links, state.currentFeeds);
};
