const makeElements = (list, type) => {
  const divCont1 = document.createElement('div');
  const divCont2 = document.createElement('div');
  const ulCont = document.createElement('ul');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  divCont1.classList.add('card', 'border-0');
  divCont2.classList.add('card-body');
  ulCont.classList.add('list-group', 'border-0', 'rounded-0');
  h2.textContent = type;
  divCont1.append(divCont2);
  divCont2.append(h2);
  divCont2.append(ulCont);
  ulCont.append(...list);
  return divCont1;
};

export default (elements, i18) => (path, value) => {
  if (path === 'form.valid') {
    switch (value) {
      case false:
        elements.feedbackP.classList.remove('text-success');
        elements.feedbackP.classList.add('text-danger');
        elements.textInput.classList.add('is-invalid');
        break;

      case true:
        elements.textInput.classList.remove('is-invalid');
        break;

      default:
        break;
    }
  }
  if (path === 'form.error') {
    const { errorType, errorMessage } = value;
    switch (errorType) {
      case 'ValidationError':
        elements.feedbackP.classList.add('text-danger');
        elements.feedbackP.textContent = i18.t(errorMessage);

        break;
      case 'parseError':
        elements.feedbackP.classList.add('text-danger');
        elements.feedbackP.textContent = i18.t(errorMessage);
        break;
      case 'AxiosError':
        elements.feedbackP.classList.add('text-danger');
        elements.feedbackP.textContent = i18.t(errorMessage);
        break;

      default:
        break;
    }
  }
  if (path === 'uiState.currentPost') {
    const { link, title, description } = value[value.length - 1];
    const titleModal = elements.modal.querySelector('.modal-title');
    const descModal = elements.modal.querySelector('.modal-body');
    const modalLink = elements.modal.querySelector('a');
    modalLink.href = link;
    titleModal.textContent = title;
    descModal.textContent = description;
  }
  if (path === 'uiState.readPosts') {
    const lastElement = value[value.length - 1];
    const { link } = lastElement;
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal');
  }
  if (path === 'descLink') {
    const rssDiv = elements.feeds;
    rssDiv.innerHTML = '';
    const rssElements = value.map((el) => {
      const li = document.createElement('li');
      const h3 = document.createElement('h3');
      const p = document.createElement('p');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      h3.classList.add('h6', 'm-0');
      p.classList.add('m-0', 'small', 'text-black-50');
      const { title, description } = el;
      h3.textContent = title.textContent;
      p.textContent = description.textContent;
      li.append(h3);
      li.append(p);
      return li;
    });
    rssDiv.append(makeElements(rssElements, 'Фиды'));
    return;
  }

  if (path === 'currentFeeds') {
    const postDiv = elements.posts;
    postDiv.innerHTML = '';
    const liList = value.map((el) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const a = document.createElement('a');
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      a.setAttribute('href', el.link);
      a.setAttribute('rel', 'noopener noreferrer');
      a.setAttribute('target', '_blank');
      a.setAttribute('data-id', el.index);
      a.classList.add('fw-bold');
      a.textContent = el.title;
      button.textContent = i18.t('rssRead');
      li.prepend(button);
      li.prepend(a);
      return li;
    });
    postDiv.append(makeElements(liList, 'Посты'));
  }
  if (path === 'form.state') {
    const { currentState, message } = value;
    switch (currentState) {
      case 'success':
        elements.textInput.classList.remove('is-invalid');
        elements.feedbackP.classList.remove('text-danger');
        elements.feedbackP.classList.add('text-success');
        elements.feedbackP.textContent = i18.t(message);
        break;
      case 'sending':
        elements.submitB.disabled = true;
        break;
      default:
        elements.submitB.disabled = false;
        break;
    }
  }
};
