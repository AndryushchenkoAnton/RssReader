import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import { setLocale } from 'yup';
import render from './render.js';
import resources from './locales/index.js';

export default () => {
  const state = {
    form: {
      lng: 'ru',
      valid: true,
      state: 'filling',
      error: null,
    },
    links: [],
  };

  const form = document.querySelector('.rss-form');
  const watcher = onChange(state, render);

  const validation = (arrayOfLinks, inputValue) => {
    setLocale({
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
          .catch((e) => {
            const message = i18nextInstance.t(e.message);
            watcher.form.valid = false;
            watcher.form.error = { type: e.name, message };
          });
      });
    });
};
