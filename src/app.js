import * as yup from 'yup';
import onChange from 'on-change';

export default () => {
  const state = {
    form: {
      valid: true,
      state: 'filling',
      error: null,
    },
    links: [],
  };

  const validateSchema = yup.string().url().notOneOf(state.links);

  const textInput = document.body.querySelector('#url-input');
  // const buttonAdd = document.body.querySelector('[aria-label = "add"]');
  const feedbackP = document.body.querySelector('.feedback');
  const form = document.body.querySelector('.rss-form');
  const watcher = onChange(state, (path, value) => {
    if (path === 'form.valid') {
      switch (value) {
        case false:
          textInput.classList.add('is-invalid');
          feedbackP.textContent = 'Ссылка должна быть валидным URL';

          break;
        case true:
          textInput.classList.remove('is-invalid');
          feedbackP.textContent = '';
          break;

        default:
          break;
      }
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const value = formData.get('url');
    validateSchema.isValid(value)
      .then((result) => {
        if (result && !watcher.links.includes((value))) {
          watcher.form.valid = true;
          watcher.links.push(value);
          form.reset();
          return;
        }
        watcher.form.valid = false;
      });
  });
};
