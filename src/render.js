const textInput = document.body.querySelector('#url-input');
const feedbackP = document.body.querySelector('.feedback');
export default (path, value) => {
  if (path === 'form.valid') {
    switch (value) {
      case false:
        textInput.classList.add('is-invalid');
        break;

      case true:
        textInput.classList.remove('is-invalid');
        break;

      default:
        break;
    }
  }
  if (path === 'form.error') {
    if (value.type === 'ValidationError') {
      feedbackP.textContent = value.message;
      return;
    }
    feedbackP.textContent = '';
  }
};
