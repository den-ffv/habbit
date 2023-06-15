"use strict";
let stateApp = [];
const APP_KEY = "APP_KEY";
let globalActiveApp;

const page = {
  menu: document.querySelector(".aside__icon"),
  header: {
    title: document.querySelector(".title "),
    progressPercent: document.querySelector(".progres-bar__prosent"),
    progressBar: document.querySelector(".progres-bar__line-blue"),
  },
  content: {
    daysConteiner: document.querySelector(".section-content"),
    nextDay: document.querySelector(".task__day"),
  },
  popUp: document.querySelector(".blure"),
  popUpButton: {
    open: document.querySelector(".add-tast"),
    close: document.querySelector(".cloase"),
  },
  iconField: document.querySelector(".popup-form input[name='icon']"),
};

function loadeDate() {
  const appString = localStorage.getItem(APP_KEY);
  const appArray = JSON.parse(appString);
  if (Array.isArray(appArray)) {
    stateApp = appArray;
  }
}
function saveData() {
  localStorage.setItem(APP_KEY, JSON.stringify(stateApp));
}
function openAndCloas() {
  if (page.popUp.classList.contains("pop-up--active")) {
    page.popUp.classList.remove("pop-up--active");
  } else {
    page.popUp.classList.add("pop-up--active");
  }
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
  }
}

function validateForm(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove("error");
    if (!fieldValue) {
      form[field].classList.add("error");
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}

function rerenderMenu(activApp) {
  if (!activApp) {
    return;
  }
  for (const app of stateApp) {
    const existed = document.querySelector(`[menu-app-id="${app.id}" ]`);
    if (!existed) {
      const element = document.createElement("button");
      element.setAttribute("menu-app-id", app.id);
      element.classList.add("aside__button-icon");
      element.addEventListener("click", () => rerender(app.id));
      element.innerHTML = `<img src="./img/${app.icon}.svg" alt="${app.nama}" />`;
      if (activApp.id === app.id) {
        element.classList.add("aside__button-icon--activ");
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activApp.id === app.id) {
      existed.classList.add("aside__button-icon--activ");
    } else {
      existed.classList.remove("aside__button-icon--activ");
    }
  }
}

function renderHead(activApp) {
  if (!activApp) {
    return;
  }
  page.header.title.innerText = activApp.name;
  const progress =
    activApp.days.length / activApp.target > 1
      ? 100
      : (activApp.days.length / activApp.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + ` %`;
  page.header.progressBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderContent(activApp) {
  page.content.daysConteiner.innerHTML = "";
  for (const index in activApp.days) {
    const element = document.createElement("div");
    element.classList.add("task");
    element.innerHTML = `
    <p class="task__day">Day ${Number(index) + 1}</p>
    <div class="task__content">
      <p class="task__text">${activApp.days[index].comment}</p>
      <button class="task__delete" onclick="deleteDey(${index})">
        <img src="./img/delete.svg" alt="delete task ${index + 1}" />
      </button>
    </div>
    `;
    page.content.daysConteiner.appendChild(element);
  }
  page.content.nextDay.innerHTML = `Day ${activApp.days.length + 1}`;
}

function rerender(activAppId) {
  globalActiveApp = activAppId;
  const activApp = stateApp.find((app) => app.id === activAppId);
  // if (!activApp) {
  //   return
  // }
  rerenderMenu(activApp);
  renderHead(activApp);
  rerenderContent(activApp);
}

function addDays(event) {
  event.preventDefault();

  const data = validateForm(event.target, ["comment"]);
  if (!data) {
    return;
  }

  stateApp = stateApp.map((app) => {
    if (app.id === globalActiveApp) {
      return {
        ...app,
        days: app.days.concat([{ comment: data.comment }]),
      };
    }
    return app;
  });
  resetForm(event.target, ["comment"]);
  rerender(globalActiveApp);
  saveData();
}

function deleteDey(index) {
  stateApp = stateApp.map((app) => {
    if (app.id === globalActiveApp) {
      app.days.splice(index, 1);
      return {
        ...app,
        days: app.days,
      };
    }
    return app;
  });
  rerender(globalActiveApp);
  saveData();
}

function setIcon(context, icon) {
  page.iconField.value = icon;
  const activIcon = document.querySelector(".button-icon.button-icon--activ");
  activIcon.classList.remove("button-icon--activ");
  context.classList.add("button-icon--activ");
}

function addHaddit(event) {
  event.preventDefault();
  const data = validateForm(event.target, ["name", "icon", "target"]);
  if (!data) {
    return;
  }
  const maxId = stateApp.reduce((acc, app) => (acc > app.id ? acc : app.id), 0);
  stateApp.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  });
  resetForm(event.target, ["name", "target"]);
  openAndCloas();
  rerender(maxId + 1);
}

(() => {
  loadeDate();
  rerender(stateApp[0].id);
})();
