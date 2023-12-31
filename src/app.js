import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import render from './render.js';
import resources from './locales/index.js';
import parse from './parser.js';

const allOrigins = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', link);
  return url;
};
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

  const elements = {
    form: document.querySelector('.rss-form'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: document.getElementById('modal'),
    submitB: document.body.querySelector('[aria-label = "add"]'),
    textInput: document.body.querySelector('#url-input'),
    feedbackP: document.body.querySelector('.feedback'),
  };
  const setText = (i18L, windowEl) => {
    const appName = document.body.querySelector('#appName');
    const appDesc = document.body.querySelector('#appDesc');
    const textHint = document.body.querySelector('#textHint');
    const submitText = document.body.querySelector('button[aria-label="add"]');
    const exampleText = document.body.querySelector('#example');
    const modalClose = windowEl.modal.querySelector('.btn-secondary');
    const modalReadFull = windowEl.modal.querySelector('a');

    appName.textContent = i18L.t('appName');
    appDesc.textContent = i18L.t('appDesc');
    textHint.textContent = i18L.t('rssTip');
    submitText.textContent = i18L.t('submitText');
    exampleText.textContent = i18L.t('exampleURL');
    modalReadFull.textContent = i18L.t('moduleReadFull');
    modalClose.textContent = i18L.t('moduleClose');
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    const state = {
      form: {
        lng: 'ru',
        valid: true,
        state: 'ready',
        error: { errorType: null },
      },
      descLink: [],
      links: [],
      currentFeeds: [],
      uiState: {
        readPosts: [],
        currentPost: null,
      },
    };

    const watcher = onChange(state, render(elements, i18nextInstance));

    const updateFeeds = (links, oldFeeds) => {
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
          watcher.form.state = { currentState: 'updating' };
        }
      })
        .catch(() => [])
        .finally(() => {
          setTimeout(() => {
            watcher.form.state = { currentState: 'ready' };
            updateFeeds(state.links, state.currentFeeds);
          }, 5000);
        });
    };

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const value = formData.get('url');
      validation(watcher.links, value)
        .then((result) => {
          watcher.form.valid = true;
          watcher.form.error = { errorType: null };

          return result;
        })
        .then((link) => {
          watcher.form.state = { currentState: 'sending', message: 'sendingPosts' };
          return axios.get(allOrigins(link));
        })
        .then((response) => {
          watcher.form.state = { currentState: 'loaded' };
          if (response.status !== 200) {
            const e = new Error(`networkError: ${response.status}`);
            throw (e);
          }
          const parsedResponse = parse(response.data.contents);
          elements.form.reset();
          watcher.links.push(value);
          watcher.form.state = { currentState: 'success', message: 'success' };
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
            watcher.form.valid = false;
            watcher.form.error = { errorType: e.message };
            return;
          }
          watcher.form.valid = false;
          watcher.form.error = { errorType: e.name };
        });
    });

    setText(i18nextInstance, elements);
    updateFeeds(state.links, state.currentFeeds);
  });
};
