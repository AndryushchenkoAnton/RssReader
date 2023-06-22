const textInput = document.body.querySelector('#url-input');
const feedbackP = document.body.querySelector('.feedback');
const submitB = document.body.querySelector('[aria-label = "add"]');

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

export default (path, value) => {
  if (path === 'form.valid') {
    switch (value) {
      case false:
        feedbackP.classList.remove('text-success');
        feedbackP.classList.add('text-danger');
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
    switch (value.type) {
      case 'ValidationError':
        feedbackP.classList.add('text-danger');
        feedbackP.textContent = value.message;

        break;
      case 'parseError':
        feedbackP.classList.add('text-danger');
        feedbackP.textContent = value.message;
        break;
      case 'axiosError':
        feedbackP.classList.add('text-danger');
        feedbackP.textContent = value.message;
        break;

      default:
        feedbackP.textContent = '';
        break;
    }
  }
  if (path === 'descLink') {
    const rssDiv = document.body.querySelector('.feeds');
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
    const postDiv = document.body.querySelector('.posts');
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
      const titleModal = document.querySelector('.modal-title');
      const descModal = document.querySelector('.modal-body');
      a.setAttribute('href', el.link);
      a.setAttribute('rel', 'noopener noreferrer');
      a.setAttribute('target', '_blank');
      a.setAttribute('data-id', el.index);
      a.classList.add('fw-bold');
      a.textContent = el.title;
      button.textContent = 'Просмотр';
      titleModal.textContent = el.title;
      descModal.textContent = el.description;
      li.prepend(button);
      li.prepend(a);
      return li;
    });
    postDiv.append(makeElements(liList, 'Посты'));
  }
  if (path === 'form.state') {
    switch (value.name) {
      case 'success':
        textInput.classList.remove('is-invalid');
        feedbackP.classList.remove('text-danger');
        feedbackP.classList.add('text-success');
        feedbackP.textContent = value.message;
        break;
      case 'sending':
        console.log(submitB);
        submitB.disabled = true;
        break;
      default:
        submitB.disabled = false;
        break;
    }
  }
};
