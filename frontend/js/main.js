class Client {
  constructor(id, createdAt, updatedAt, name, surname, lastName, contacts) {
    this.id = id
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.name = name
    this.surname = surname
    this.lastName = lastName
    this.contacts = contacts
  }

  get fio() {
    return this.surname + ' ' + this.name + ' ' + this.lastName
  }
}

let windowInnerHeight = window.innerHeight
let header = document.querySelector('.header')
let headerHeight = header.offsetHeight
let mainSection = document.querySelector('.main')

const SERVER_URL = 'http://localhost:3000'

let inputsElems;
if (location.hash !== '') {
  openChangeCard()
}

function createEl(tag, classNames = [], text) {
  const el = document.createElement(tag);
  el.textContent = text;

  for (const clName of classNames) {
    el.classList.add(clName);
  }

  return el;
}

function createErrorMessage(errorText) {
  const errorMessage = createEl('span', ['invalid-feedback'], errorText);
  return errorMessage;
}

function showErrMessage(errContaner, errElem, inp) {
  inp.classList.add('input-warning-style');
  errContaner.append(errElem);
}

function cleanErrMess(container, inp) {
  if (inp.classList.contains('input-warning-style')) {
    const errMessEl = container.querySelector('.invalid-feedback');
    inp.classList.remove('input-warning-style');
  }
}

function checkContactValue(inp) {
  if (inp.value !== '') {
    inp.classList.remove('input-warning-style');
  }
}

function showErrorMessages(inputs, errors = [], inputWrap) {
  console.log('Ошибки', errors);
  console.log(inputs)
  inputWrap.innerHTML = ''
  let errorContacts = 0


  for (const input of inputs) {
    const hasErr = errors.find(err => input.dataset.error === err.field);
    console.log(hasErr)

    if (hasErr) {
      if (input.dataset.error === 'contacts') {
        if (errorContacts === 0) {
          cleanErrMess(inputWrap, input);
          cleanErrMess(inputWrap, input);
          const errElem = createErrorMessage(hasErr.message + '. ');
          showErrMessage(inputWrap, errElem, input);
          checkContactValue(input)
          errorContacts = 1
        } else {
          cleanErrMess(inputWrap, input);
          showErrMessage(inputWrap, '', input);
          checkContactValue(input)
        }

      } else {
        cleanErrMess(inputWrap, input);
        const errElem = createErrorMessage(hasErr.message + '. ');
        showErrMessage(inputWrap, errElem, input);
      }
    } else {
      cleanErrMess(inputWrap, input);
    }
  }
}

async function serverAddClient(obj) {
  try {
    let response = await fetch(SERVER_URL + '/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(obj),
    })
    let data = await response.json();
    let inputWrap = document.getElementById('create__warning-style')

    if (response.ok) {
      console.log('Добавление клиента', data);
      inputWrap.innerHTML = ''
      return data;
    }
    inputsElems = document.querySelectorAll('#create__input-surname, #create__input-name, .create__contact-input');
    inputWrap.innerHTML = ''
    showErrorMessages(inputsElems, data.errors, inputWrap);
  } catch (error) {
    console.error(error)
  }
}

async function serverChangeClient(obj) {
  try {
    let response = await fetch(SERVER_URL + '/api/clients/' + obj.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj),
    })
    let data = await response.json();
    let inputWrap = document.getElementById('change__warning-style')

    if (response.ok) {
      inputWrap.innerHTML = ''
      return data;
    }
    inputsElems = document.querySelectorAll('#change__input-surname, #change__input-name, .change__contact-input');
    inputWrap.innerHTML = ''
    showErrorMessages(inputsElems, data.errors, inputWrap);

  } catch (error) {
    console.error(error)
  }


}

async function serverGetClients() {
  let response = await fetch(SERVER_URL + '/api/clients', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  let data = await response.json();
  return data;
}

async function serverDeleteClient(id) {
  let response = await fetch(SERVER_URL + '/api/clients/' + id, {
    method: 'DELETE'
  })
  let data = await response.json();
  return data;
}

async function serverGetClient(id) {
  let response = await fetch(SERVER_URL + '/api/clients/' + id, {
    method: 'GET'
  })
  let data = await response.json();
  return data;
}

let clients = []

async function checkData() {
  let preloader = showTableLoader()
  let serverData = await serverGetClients();
  deleteTablePreloader(preloader)

  if (serverData) {
    for (let i = 0; i < serverData.length; i++) {
      let client = serverData[i]
      clients.push(new Client(client.id, client.createdAt, client.updatedAt, client.name, client.surname, client.lastName, client.contacts))
    }
    render(clients)
  } else {
    render(clients)
  }
  return clients;
}

checkData()

const $clientsList = document.getElementById('clients-list')
const $clientsListTHAll = document.querySelectorAll('.clients-table th')
let column = 'id'
let columnDir = true
let listener = null

let clicksCreate = 0
let clicksChange = 0
let blocksCountCreate = 0
let blocksCountChange = 0
let warningCountCreate = 0
let warningCountChange = 0

function newClientTR(client) {
  const $clientTR = document.createElement('tr');
  $clientTR.classList.add('body-tr')
  const $idTD = document.createElement('td');
  $idTD.classList.add('id-td', 'main__table-td')
  const $fioTD = document.createElement('td');
  $fioTD.classList.add('name-td')
  const $createdAtTD = document.createElement('td');
  $createdAtTD.classList.add('create-td')
  const $createdTimeSpan = document.createElement('span');
  $createdTimeSpan.classList.add('td-time')
  const $updatedAtTD = document.createElement('td');
  $updatedAtTD.classList.add('changes-td')
  const $updatedTimeSpan = document.createElement('span');
  $updatedTimeSpan.classList.add('td-time')
  const $contactsTD = document.createElement('td');
  $contactsTD.classList.add('contacts-td')
  const $actionsTD = document.createElement('td');
  $actionsTD.classList.add('actions-td')
  const $btnChange = document.createElement('button');
  const $btnDelete = document.createElement('button');
  $btnChange.classList.add('main__change-btn', 'btn-reset')
  $btnChange.textContent = 'Изменить'
  $btnDelete.classList.add('main__delete-btn', 'btn-reset')
  $btnDelete.textContent = 'Удалить'

  $clientTR.append($idTD)
  $clientTR.append($fioTD)
  $clientTR.append($createdAtTD)
  $clientTR.append($updatedAtTD)
  $clientTR.append($contactsTD)
  $clientTR.append($actionsTD)
  $actionsTD.append($btnChange, $btnDelete)

  let count = 0
  btnsArr = []
  if (client?.contacts) {
    if ((client.contacts.length) === 1) {
      if (client.contacts[0].type.includes('vk')) {
        let $vkBtn = document.createElement('button');
        $vkBtn.classList.add('contact-vk', 'contact-btn', 'btn-reset')
        createContactIcon($vkBtn, client.contacts[0].type)
        tippy($vkBtn, {
          content: client.contacts[0].type + ': ' + client.contacts[0].value,
        });
        count += 1
        if (count > 4) { displayNoneBtns($vkBtn) }
      }
      else if (client.contacts[0].type.includes('Телефон')) {
        let $telBtn = document.createElement('button');
        $telBtn.classList.add('contact-phone', 'contact-btn', 'contact-btn-circle', 'btn-reset')
        createContactIcon($telBtn, client.contacts[0].type)
        tippy($telBtn, {
          content: client.contacts[0].type + ': ' + client.contacts[0].value,
        });
        count += 1
        if (count > 4) { displayNoneBtns($telBtn) }
      }
      else if (client.contacts[0].type.includes('Email')) {
        let $mailBtn = document.createElement('button');
        $mailBtn.classList.add('contact-mail', 'contact-btn', 'btn-reset')
        createContactIcon($mailBtn, client.contacts[0].type)
        tippy($mailBtn, {
          content: client.contacts[0].type + ': ' + client.contacts[0].value,
        });
        count += 1
        if (count > 4) { displayNoneBtns($mailBtn) }
      }
      else if (client.contacts[0].type.includes('Facebook')) {
        let $fbBtn = document.createElement('button');
        $fbBtn.classList.add('contact-fb', 'contact-btn', 'btn-reset')
        createContactIcon($fbBtn, client.contacts[0].type)
        tippy($fbBtn, {
          content: client.contacts[0].type + ': ' + client.contacts[0].value,
        });
        count += 1
        if (count > 4) { displayNoneBtns($fbBtn) }
      } else {
        let $otherBtn = document.createElement('button');
        $otherBtn.classList.add('contact-another', 'contact-btn', 'btn-reset')
        createContactIcon($otherBtn, client.contacts[0].type)
        tippy($otherBtn, {
          content: client.contacts[0].type + ': ' + client.contacts[0].value,
        });
        count += 1
        if (count > 4) { displayNoneBtns($otherBtn) }
      }
    } else {
      for (const obj of client.contacts) {
        if (obj.type.includes('VK')) {
          let $vkBtn = document.createElement('button');
          $vkBtn.classList.add('contact-vk', 'contact-btn', 'btn-reset')
          createContactIcon($vkBtn, obj.type)
          tippy($vkBtn, {
            content: obj.type + ': ' + obj.value,
          });
          count += 1
          if (count > 4) { displayNoneBtns($vkBtn) }
        }
        else if (obj.type.includes('Телефон')) {
          let $telBtn = document.createElement('button');
          $telBtn.classList.add('contact-phone', 'contact-btn', 'contact-btn-circle', 'btn-reset')
          createContactIcon($telBtn, obj.type)
          tippy($telBtn, {
            content: obj.type + ': ' + obj.value,
          });
          count += 1
          if (count > 4) { displayNoneBtns($telBtn) }
        }
        else if (obj.type.includes('Email')) {
          let $mailBtn = document.createElement('button');
          $mailBtn.classList.add('contact-mail', 'contact-btn', 'btn-reset')
          createContactIcon($mailBtn, obj.type)
          tippy($mailBtn, {
            content: obj.type + ': ' + obj.value,
          });
          count += 1
          if (count > 4) { displayNoneBtns($mailBtn) }
        }
        else if (obj.type.includes('Facebook')) {
          let $fbBtn = document.createElement('button');
          $fbBtn.classList.add('contact-fb', 'contact-btn', 'btn-reset')
          createContactIcon($fbBtn, obj.type)
          tippy($fbBtn, {
            content: obj.type + ': ' + obj.value,
          });
          count += 1
          if (count > 4) { displayNoneBtns($fbBtn) }
        } else {
          let $otherBtn = document.createElement('button');
          $otherBtn.classList.add('contact-another', 'contact-btn', 'btn-reset')
          createContactIcon($otherBtn, obj.type)
          tippy($otherBtn, {
            content: obj.type + ': ' + obj.value,
          });
          count += 1
          if (count > 4) { displayNoneBtns($otherBtn) }
        }

        if (count === 5 && client.contacts.length > 5) {
          let $lineBreak = document.createElement('span');
          $lineBreak.classList.add('span__line-break')
          $contactsTD.append($lineBreak)
          $lineBreak.style.marginBottom = '5px'
        }

        if (client.contacts.length > 4 && count === 4) {
          let $otherContactsBtn = document.createElement('button');
          $otherContactsBtn.classList.add('contact-other', 'contact-btn', 'btn-reset')
          $otherContactsBtn.textContent = '+' + (client.contacts.length - 4)
          $contactsTD.append($otherContactsBtn)


          $otherContactsBtn.addEventListener('click', function () {
            $otherContactsBtn.style.display = "none";
            if (client.contacts.length > 5) {
              $contactsTD.style.paddingTop = '10px'
            }
            let items = document.querySelectorAll('.hidden-btn-' + clients.indexOf(client))
            for (item of items) {
              item.classList.remove('hidden');
              item.style.display = 'block';
            }
          })
        }
      }
    }
  }

  function createContactIcon(btn, type) {
    $contactsTD.append(btn)
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (type.includes('Facebook')) {
      path.setAttribute('d', 'M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z');
    } else if (type.includes('VK')) {
      path.setAttribute('d', 'M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z');
    } else if (type.includes('Телефон')) {
      let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '8');
      circle.setAttribute('cy', '8');
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', '#9873FF');
      path.setAttribute('d', 'M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z');
      path.setAttribute('fill', 'white');
      svg.setAttribute('opacity', '0.7');
      svg.appendChild(circle);
    } else if (type.includes('Email')) {
      path.setAttribute('d', 'M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z');
    } else {
      path.setAttribute('d', 'M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z');
    }
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    if (type.includes('Телефон') === false) {
      path.setAttribute('opacity', '0.7');
      path.setAttribute('fill', '#9873FF');
    }
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.appendChild(path);
    btn.append(svg);
    return btn;
  }

  function displayNoneBtns(btn) {
    btn.classList.add('hidden', 'hidden-btn-' + clients.indexOf(client))
  }

  $idTD.textContent = client.id
  $fioTD.textContent = client.surname + ' ' + client.name + ' ' + client.lastName
  $createdTimeSpan.textContent = formatTime(new Date(client.createdAt))
  $createdAtTD.textContent = formatDateCreatedAt(client)
  $createdAtTD.append($createdTimeSpan)
  $updatedTimeSpan.textContent = formatTime(new Date(client.updatedAt))
  $updatedAtTD.textContent = formatDateUpdatedAt(client)
  $updatedAtTD.append($updatedTimeSpan)


  $btnChange.addEventListener('click', function () {
    location.hash = client.id
    let smallPreloader = createSmallPreloader($btnChange, $actionsTD)
    openClientCard($btnChange, smallPreloader)
  })



  $btnDelete.addEventListener('click', function () {
    document.getElementById('modal-delete').classList.add('open');
    disableScroll()
    listener = deleteClient.bind(deleteClient, client.id, $clientTR)
    closeModal('delete', 'modal-close-delete', listener)
    document.getElementById('delete-client__btn').addEventListener('click', listener)
  })

  return $clientTR;
}

async function deleteClient(id, tr) {
  await serverDeleteClient(id)
  tr.remove()
  document.getElementById('modal-delete').classList.remove('open')
  enableScroll()
  document.getElementById('delete-client__btn').removeEventListener('click', listener)
}

async function openChangeCard() {
  let id = location.hash.substring(1)

  let client = await serverGetClient(id)

  let clientId = document.createElement('div')
  clientId.classList.add('client-id')
  clientId.textContent = 'ID: ' + client.id
  document.getElementById('change__modal__content').append(clientId)
  let surnameInput = document.getElementById('change__input-surname')
  surnameInput.value = client.surname
  let nameInput = document.getElementById('change__input-name')
  nameInput.value = client.name
  let lastnameInput = document.getElementById('change__input-lastname')
  lastnameInput.value = client.lastName
  if (client.contacts) {
    for (obj of client.contacts) {
      createContactBlock('change', obj)
      if (blocksCountChange === 10) {
        document.getElementById('change__add-contact').style.display = 'none'
      }
    }
  }
  document.getElementById('modal-change').classList.add('open');

  document.getElementById('change__save-client').addEventListener('click', async function (event) {
    event.preventDefault()

    let totalError = validation('change')

    if (totalError === '') {
      let savePreloader = createPreloader()
      document.getElementById('change__modal__content').append(savePreloader)
      let changesClient = {
        id: client.id,
        name: document.getElementById('change__input-name').value,
        surname: document.getElementById('change__input-surname').value,
        lastName: document.getElementById('change__input-lastname').value,
        contacts: collectContacts('change')
      }

      let serverDataObj = await serverChangeClient(changesClient);

      console.log(serverDataObj)

      if (typeof serverDataObj !== 'undefined') {
        let newClients = await serverGetClients()

        console.log(clients)
        render(newClients);

        clearModal('change')
        savePreloader.remove()
        document.getElementById('modal-change').classList.remove('open')
      }
    }
  })

  closeModal('change', 'modal-close-change')
  document.getElementById('change__delete-btn').addEventListener('click', function () {
    document.getElementById('modal-change').classList.remove('open');
    document.getElementById('modal-delete').classList.add('open');
    closeModal('delete', 'modal-close-delete')
  })
}

async function openClientCard(btn, preloader) {
  let id = location.hash.substring(1)

  let client = await serverGetClient(id)

  let clientId = document.createElement('div')
  clientId.classList.add('client-id')
  clientId.textContent = 'ID: ' + client.id
  document.getElementById('change__modal__content').append(clientId)
  let surnameInput = document.getElementById('change__input-surname')
  surnameInput.value = client.surname
  let nameInput = document.getElementById('change__input-name')
  nameInput.value = client.name
  let lastnameInput = document.getElementById('change__input-lastname')
  lastnameInput.value = client.lastName
  if (client.contacts) {
    for (obj of client.contacts) {
      createContactBlock('change', obj)
      if (blocksCountChange === 10) {
        document.getElementById('change__add-contact').style.display = 'none'
      }
    }
  }
  document.getElementById('modal-change').classList.add('open');
  disableScroll()

  deleteSmallPreloader(btn, preloader)

  document.getElementById('change__save-client').addEventListener('click', async function (event) {
    event.preventDefault()

    let totalError = validation('change')

    if (totalError === '') {
      let savePreloader = createPreloader()
      document.getElementById('change__modal__content').append(savePreloader)
      let changesClient = {
        id: client.id,
        name: document.getElementById('change__input-name').value,
        surname: document.getElementById('change__input-surname').value,
        lastName: document.getElementById('change__input-lastname').value,
        contacts: collectContacts('change')
      }

      let serverDataObj = await serverChangeClient(changesClient);

      console.log(serverDataObj)

      if (typeof serverDataObj !== 'undefined') {
        let newClients = await serverGetClients()

        console.log(clients)
        render(newClients);

        clearModal('change')
        savePreloader.remove()
        document.getElementById('modal-change').classList.remove('open')
        enableScroll()
      }
    }
  })

  closeModal('change', 'modal-close-change')
  document.getElementById('change__delete-btn').addEventListener('click', function () {
    document.getElementById('modal-change').classList.remove('open');
    document.getElementById('modal-delete').classList.add('open');
    closeModal('delete', 'modal-close-delete')
  })
}



document.getElementById('change__add-contact').addEventListener('click', function (e) {
  e.preventDefault()
  clicksChange += 1

  if (blocksCountChange >= 0 && blocksCountChange < 10) {
    createContactBlock('change')
  }
  if (clicksChange > 0 && blocksCountChange === 10) {
    document.getElementById('change__add-contact').style.display = 'none'
  }
})

function formatDate(date) {
  year = date.getFullYear();
  month = date.getMonth() + 1;
  dt = date.getDate();

  if (dt < 10) {
    dt = '0' + dt;
  }

  if (month < 10) {
    month = '0' + month;
  }

  return (dt + '.' + month + '.' + year + ' ');
}

function formatTime(date) {
  hours = date.getHours()
  mins = date.getMinutes()

  if (hours < 10) {
    hours = '0' + hours;
  }

  if (mins < 10) {
    mins = '0' + mins;
  }

  time = (hours + ':' + mins)

  return time;
}

function formatDateCreatedAt(client) {
  date = new Date(client.createdAt);
  return formatDate(date)
}

function formatDateUpdatedAt(client) {
  date = new Date(client.updatedAt);
  return formatDate(date);
}

function render(arr) {
  getSortClients(arr, column, columnDir)
  $clientsList.innerHTML = ''

  for (client of arr) {
    $clientsList.append(newClientTR(client))
  }
}

function getSortClients(arr, prop, dir) {
  return arr.sort(function (clientA, clientB) {
    if ((!dir == false ? clientA[prop] < clientB[prop] : clientA[prop] > clientB[prop]))
      return -1;
  })
}

const $clientsListTHSort = document.querySelectorAll('.clients-table .th-sort')
$clientsListTHSort.forEach(element => {
  let cellTitle;
  let cellClass;
  let rotation = 0;
  document.querySelector('.id-th').style.color = '#9873FF'
  element.addEventListener('click', function () {

    if (column !== this.dataset.column) {
      titlesForSorting(column)
      column = this.dataset.column
      titlesForSorting(column).style.color = '#9873FF'
    } else if (column === this.dataset.column) {
      cellClass = classesForSorting(column)
      titlesForSorting(column).style.color = '#9873FF'
      rotation = rotation + 180;
      document.querySelector(cellClass + ' svg').style.transform = 'rotate(' + rotation + 'deg)'
    }
    column = this.dataset.column;
    columnDir = !columnDir;
    titlesForSorting(column).style.color = '#9873FF'
    render(clients);
  })
})

function titlesForSorting(column) {
  if (column === 'fio') {
    cellTitle = document.querySelector('.name-th')
    cellTitle.style.color = '#B0B0B0'
  } else if (column === 'createdAt') {
    cellTitle = document.querySelector('.create-th')
    cellTitle.style.color = '#B0B0B0'
  } else if (column === 'updatedAt') {
    cellTitle = document.querySelector('.changes-th')
    cellTitle.style.color = '#B0B0B0'
  } else {
    cellTitle = document.querySelector('.' + column + '-th')
    cellTitle.style.color = '#B0B0B0'
  }
  return cellTitle
}

function classesForSorting(column) {
  if (column === 'fio') {
    cellTitle = document.querySelector('.name-th')
    cellClass = '.name-th'
  } else if (column === 'createdAt') {
    cellTitle = document.querySelector('.create-th')
    cellClass = '.create-th'
  } else if (column === 'updatedAt') {
    cellTitle = document.querySelector('.changes-th')
    cellClass = '.changes-th'
  } else {
    cellTitle = document.querySelector('.' + column + '-th')
    cellClass = '.id-th'
  }
  return cellClass
}

document.getElementById('modal-create-btn').addEventListener('click', function () {
  document.getElementById('modal-create').classList.add('open');
  disableScroll()
  closeModal('create', 'modal-close-create')
})


document.getElementById('create__save-client').addEventListener('click', async function (event) {

  event.preventDefault()

  let totalError = validation('create')

  if (totalError === '') {
    let savePreloader = createPreloader()
    document.getElementById('create__modal__content').append(savePreloader)
    let newClient = {
      name: document.getElementById('create__input-name').value,
      surname: document.getElementById('create__input-surname').value,
      lastName: document.getElementById('create__input-lastname').value,
      contacts: collectContacts('create')
    }

    console.log(newClient)

    let serverDataObj = await serverAddClient(newClient);
    console.log(serverDataObj)

    if (typeof serverDataObj !== 'undefined') {
      clients.push(serverDataObj)

      let newClients = await serverGetClients()
      render(newClients);

      clearModal('create')
      savePreloader.remove()
      document.getElementById('modal-create').classList.remove('open')
      enableScroll()
      document.getElementById('create__warning-style').innerHTML = ''
    }
  }
})

function cleanValidation(modal) {
  let errorContainer = document.getElementById(modal + '__warning-style')
  if (errorContainer !== '') {
    errorContainer.innerHTML = ''
  }
  inputsElems = document.querySelectorAll('#' + modal + '__input-surname, #' + modal + '__input-name, .' + modal + '__contact-input');
  for (input of inputsElems) {
    if (input.classList.contains('input-warning-style')) {
      input.classList.remove('input-warning-style');
    }
  }
}

function collectContacts(modal) {
  let blocks = document.querySelectorAll('.' + modal + '__contacts-block.visible')
  let contacts = []
  for (block of blocks) {
    let type = block.querySelector('.' + modal + '__select').value;
    let value = block.querySelector('.' + modal + '__contact-input').value;
    contacts.push({
      type: type,
      value: value
    })
  }
  return contacts
}

function clearModal(modal) {
  let inputs = document.querySelectorAll('.' + modal + '__container-1 > input');
  for (input of inputs) {
    input.style.removeProperty('border-color')
    input.value = ''
    input.textContent = ''
    input.style.removeProperty('background-color')
  }

  if (modal !== 'delete') {
    let container = document.getElementById(modal + '__contacts-container')
    container.innerHTML = ''
    container.style.paddingTop = ''
    if (modal === 'create') {
      clicksCreate = 0
      blocksCountCreate = 0
      warningCountCreate = 0
    } else {
      clicksChange = 0
      blocksCountChange = 0
      warningCountChange = 0
      document.getElementById('change__add-contact').style.display = 'block'
      let ids = document.querySelectorAll('.client-id')
      for (id of ids) {
        id.remove()
      }
    }
    cleanValidation(modal)
  }
  if (modal === 'change') {
    history.pushState("", document.title, window.location.pathname);
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('modal-create').classList.contains('open')) {
      document.getElementById('modal-create').classList.remove('open');
      enableScroll()
      clearModal('create')
    } else if (document.getElementById('modal-change').classList.contains('open')) {
      document.getElementById('modal-change').classList.remove('open');
      enableScroll()
      clearModal('change')
    } else if (document.getElementById('modal-delete').classList.contains('open')) {
      document.getElementById('modal-delete').classList.remove('open');
      enableScroll()
      document.getElementById('delete-client__btn').removeEventListener('click', listener)
    }
  }
})

document.querySelector('#modal-change .modal__content').addEventListener('click', event => {
  event._isClickWithInModal = true;
})

document.getElementById('modal-change').addEventListener('click', event => {
  if (event._isClickWithInModal) return;
  document.getElementById('modal-change').classList.remove('open')
  enableScroll()
  clearModal('change')
})

document.querySelector('#modal-delete .modal__content').addEventListener('click', event => {
  event._isClickWithInModal = true;
})

document.getElementById('modal-delete').addEventListener('click', event => {
  if (event._isClickWithInModal) return;
  document.getElementById('modal-delete').classList.remove('open')
  enableScroll()
  document.getElementById('delete-client__btn').removeEventListener('click', listener)
})

document.querySelector('#modal-create .modal__content').addEventListener('click', event => {
  event._isClickWithInModal = true;
})

document.getElementById('modal-create').addEventListener('click', event => {
  if (event._isClickWithInModal) return;
  document.getElementById('modal-create').classList.remove('open')
  enableScroll()
  clearModal('create')
})

function closeModal(modal, btn, listener) {
  let btns = document.querySelectorAll('.' + btn)
  for (btn of btns) {
    btn.addEventListener('click', function (e) {
      e.preventDefault()
      document.getElementById('modal-' + modal).classList.remove('open')
      clearModal(modal)
      enableScroll()
      if (modal === 'delete') {
        document.getElementById('delete-client__btn').removeEventListener('click', listener)
      }
    })
  }
}


document.getElementById('create__add-contact').addEventListener('click', function (e) {
  e.preventDefault()
  clicksCreate += 1

  if (blocksCountCreate >= 0 && blocksCountCreate < 10) {
    createContactBlock('create')
  }
  if (clicksCreate > 0 && blocksCountCreate === 10) {
    document.getElementById('create__add-contact').style.display = 'none'
  }
})

function createContactBlock(modal, obj) {
  const container = document.getElementById(modal + '__contacts-container')
  let $block = document.createElement('div');
  $block.classList.add(modal + '__contacts-block', 'flex');
  $block.setAttribute('data-error', 'contacts');
  container.append($block)
  let $select = document.createElement('select');
  $select.classList.add(modal + '__select', 'choices');
  let $option1 = document.createElement('option');
  $option1.textContent = 'Телефон'
  $option1.value = 'Телефон'
  $select.append($option1)
  let $option2 = document.createElement('option');
  $option2.textContent = 'Email'
  $option2.value = 'Email'
  $select.append($option2)
  let $option3 = document.createElement('option');
  $option3.textContent = 'Facebook'
  $option3.value = 'Facebook'
  $select.append($option3)
  let $option4 = document.createElement('option');
  $option4.textContent = 'VK'
  $option4.value = 'VK'
  $select.append($option4)
  let $option5 = document.createElement('option');
  $option5.textContent = 'Другое'
  $option5.value = 'Другое'
  $select.append($option5)

  const $input = document.createElement('input');
  $input.classList.add(modal + '__contact-input', modal + '__input', 'contact-input-style', 'input-style');
  $input.placeholder = "Введите данные контакта"
  $input.setAttribute('data-error', 'contacts');
  if (obj) {
    $select.value = obj.type
    $input.value = obj.value
  }
  const choices = new Choices($select, {
    allowHTML: true,
    searchEnabled: false,
    duplicateItemsAllowed: false,
    shouldSort: false,
    shouldSortItems: false,
    renderSelectedChoices: true,
  })
  $block.append(choices.containerOuter.element)
  $block.append($input)
  let $btn = document.createElement('button')
  $btn.classList.add('btn__delete-contact', 'btn-reset')
  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'none');
  path.setAttribute('d', 'M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z');
  path.setAttribute('fill', '#B0B0B0');
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.appendChild(path);
  $btn.append(svg);
  $block.append($btn)
  container.style.paddingTop = '25px'
  setTimeout(() => $block.classList.add('visible'),
    $block.style.marginBottom = '15px', 100);
  if (modal === 'create') {
    blocksCountCreate += 1
  } else {
    blocksCountChange += 1
  }

  $btn.addEventListener('click', function (e) {
    e.preventDefault
    if (modal === 'create') {
      blocksCountCreate -= 1
    } else {
      blocksCountChange -= 1
    }
    $block.remove()
    $block.style.marginBottom = '0'
    if (modal === 'create') {
      if (blocksCountCreate < 10) {
        document.getElementById('create__add-contact').style.display = 'block'
      }
      console.log('blocks: ' + blocksCountCreate)
      if (blocksCountCreate === 0) {
        container.style.paddingTop = '0'
      }
    } else {
      if (blocksCountChange < 10) {
        document.getElementById('change__add-contact').style.display = 'block'
      }
      console.log('blocks: ' + blocksCountChange)
      if (blocksCountChange === 0) {
        container.style.paddingTop = '0'
      }
    }

  })
}

let timerId;
let searchInput = document.getElementById('search');

searchInput.addEventListener('input', function (e) {
  clearTimeout(timerId)
  timerId = setTimeout(function () {
    search(e.target.value)
  }, 300)
})

searchInput.addEventListener('focus', function (e) {
  if (searchInput.value.trim()) {
    search(e.target.value)
  }
})

async function search(txt) {
  let response = await fetch(SERVER_URL + '/api/clients?search=' + txt, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  let data = await response.json();
  if (txt === '') {
    render(data)
    document.getElementById('search-list').innerHTML = ''
  } else {
    createList(data)
  }
}

let searchListIsOpen = 0

function createList(data) {
  let searchList = document.getElementById('search-list')
  searchList.style.visibility = 'visible'
  searchListIsOpen = 1
  let scrollDisabled
  console.log(searchListIsOpen)
  if (scrollDisabled !== 1) {
    disableScroll()
    scrollDisabled = 1
  }
  searchList.innerHTML = ''
  let searchInput = document.getElementById('search')

  data.forEach(item => {
    const searchItem = document.createElement('li')
    searchItem.setAttribute('tabindex', '0')
    const searchLink = document.createElement('a')
    searchLink.setAttribute('tabindex', '-1')

    searchItem.classList.add('search__list-item')
    searchLink.classList.add('search__list-link')

    searchLink.textContent = `${item.surname} ${item.name} ${item.lastName}`
    searchLink.href = '#'

    searchItem.append(searchLink)
    searchList.append(searchItem)

    searchItem.addEventListener('click', function () {
      searchInput.value = searchLink.textContent
      searchList.style.visibility = 'hidden'
      enableScroll()
      scrollDisabled = 0

      let namesTD = document.querySelectorAll('.body-tr .name-td')
      for (nameTD of namesTD) {
        if (nameTD.textContent === searchLink.textContent) {
          let bodyTR = nameTD.closest('.body-tr')
          bodyTR.style.backgroundColor = 'rgb(228, 228, 228)'
          bodyTR.style.transition = 'all .6s ease'

          bodyTR.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          bodyTR.addEventListener('mouseleave', function () {
            bodyTR.style.backgroundColor = 'var(--white)'
          })
        }
      }
    })
  })

  document.addEventListener('click', closeSearchList.bind(null, 1, 2));

  document.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
      searchOnEnter(document.activeElement)
    } else if (e.keyCode === 38) {
      moveUp(document.activeElement)
    } else if (e.keyCode === 40) {
      moveDown(document.activeElement)
    } else if (e.key === 'Escape') {
      searchList.style.visibility = 'hidden'
      enableScroll()
      scrollDisabled = 0
    }
  })
}

let searchList = document.getElementById('search-list')

function closeSearchList(a, b, e) {
  console.log(searchListIsOpen)
  if (searchListIsOpen === 1) {
    const withinBoundaries = e.composedPath().includes(searchList);

    if (!withinBoundaries && e.target.dataset.search !== 'search') {
      searchList.style.visibility = 'hidden'
      enableScroll()
      scrollDisabled = 0
      searchListIsOpen = 0
      document.removeEventListener('click', closeSearchList.bind(null, 1, 2));
    }
  }
}

function searchOnEnter(item) {
  let searchInput = document.getElementById('search')
  let searchList = document.getElementById('search-list')
  let searchLink = item.children[0]
  searchInput.value = searchLink.textContent
  searchList.style.visibility = 'hidden'
  enableScroll()
  scrollDisabled = 0
  searchListIsOpen = 0

  let namesTD = document.querySelectorAll('.body-tr .name-td')
  for (nameTD of namesTD) {
    if (nameTD.textContent === searchLink.textContent) {
      let bodyTR = nameTD.closest('.body-tr')
      bodyTR.style.backgroundColor = 'rgb(228, 228, 228)'
      bodyTR.style.transition = 'all .6s ease'

      bodyTR.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      bodyTR.addEventListener('mouseleave', function () {
        bodyTR.style.backgroundColor = 'var(--white)'
      })
    }

  }
}

function moveUp(item) {
  let aboveElem = item.previousElementSibling
  console.log(aboveElem)
  if (aboveElem !== null) {
    aboveElem.focus()
  }
}

function moveDown(item) {
  let belowElem = item.nextElementSibling
  console.log(belowElem)
  if (belowElem !== null) {
    belowElem.focus()
  }
}

function createWarning(modal, text) {
  let warning = document.getElementById(modal + '__warning-style')
  warning.classList.remove('hidden')
  warning.textContent = text
  warning.style.marginBottom = '10px'
  return warning
}

function validation(modal) {
  let name = document.getElementById(modal + '__input-name').value
  let surname = document.getElementById(modal + '__input-surname').value
  let blocks = document.querySelectorAll('.' + modal + '__contacts-block.visible')
  let error1
  let error2
  if (name !== '' && surname !== '') {
    error1 = ''
  } else {
    error1 = 'Имя и фамилия обязательны для заполнения. '
    if (name === '') {
      document.getElementById(modal + '__input-name').style.backgroundColor = '#fff1f1'
      document.getElementById(modal + '__input-name').addEventListener('input', function () {
        document.getElementById(modal + '__input-name').style.backgroundColor = 'white'
      });
    }
    if (surname === '') {
      document.getElementById(modal + '__input-surname').style.backgroundColor = '#fff1f1'
      document.getElementById(modal + '__input-surname').addEventListener('input', function () {
        document.getElementById(modal + '__input-surname').style.backgroundColor = 'white'
      });
    }
  }

  if (blocks.length !== 0) {
    for (block of blocks) {
      let value = block.querySelector('.' + modal + '__contact-input').value;
      if (value !== '') {
        error2 = ''
      } else {
        error2 = 'Контакты должны быть полностью заполнены.'
        block.querySelector('div > input').style.backgroundColor = '#fff1f1'
        block.querySelector('div > input').addEventListener('input', function () {
          block.querySelector('div > input').style.backgroundColor = 'white'
        });
      }
    }
  } else {
    error2 = ''
  }

  let totalError = error1 + error2

  if (totalError !== '') {
    createWarning(modal, totalError)
  }

  return totalError
}

function showTableLoader() {
  let container = document.querySelector('.main__loader-container')
  container.style.minHeight = '325px'
  let loader = createPreloader()
  container.append(loader)
  let mask = document.querySelector('.mask')
  let $thead = document.querySelector('.main__table-head')
  let $theadHeight = $thead.offsetHeight
  mask.style.top = $theadHeight + 'px'
  return loader
}

function deleteTablePreloader(preloader) {
  preloader.remove()
  let container = document.querySelector('.main__loader-container')
  container.style.minHeight = '0'
}

function createPreloader() {
  let mask = document.createElement('div')
  mask.classList.add('mask', 'flex')
  let loader = document.createElement('div')
  loader.classList.add('loader')
  mask.append(loader)
  return mask
}

function createSmallPreloader(btn, container) {
  let preloader = document.createElement('div')
  preloader.classList.add('loader', 'small-loader')
  btn.style.paddingLeft = '0'
  btn.style.backgroundImage = 'none'
  btn.style.marginLeft = '3px'
  container.prepend(preloader)
  return preloader
}

function deleteSmallPreloader(btn, preloader) {
  preloader.remove()
  btn.style.paddingLeft = '16px'
  btn.style.backgroundImage = 'url(../img/change.png)';
  btn.style.marginLeft = '0'
}

let fixBlocks = document.querySelectorAll('.fix-block')

function disableScroll() {
  let paddingOffset = window.innerWidth - document.body.offsetWidth + 'px'
  fixBlocks.forEach((el) => {
    el.style.paddingRight = paddingOffset
  })
  document.body.classList.add('stop-scroll')
  if (window.innerWidth > 1024) {
    document.body.style.paddingRight = paddingOffset
  }
}

function enableScroll() {
  document.body.classList.remove('stop-scroll')
  fixBlocks.forEach((el) => {
    el.style.paddingRight = '0px';
  })
  document.body.style.paddingRight = '0px'
}
