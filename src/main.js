import "./style.css";
import { object, string } from "yup";
import { proxy } from "valtio/vanilla";
import initView from "./view.js";
import i18next from "i18next";
import { en, ru } from "./locales/index.js";
import { setLocale } from "yup";

i18next.init({
  lng: "ru", // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en,
    ru,
  },
});

const initialState = {
  addedUrls: [],
  form: {
    url: "",
    valid: true,
    error: null,
  },
};

const watchedState = proxy(initialState);

setLocale({
  string: {
    url: () => "url.validation.url",
  },
  mixed: {
    notOneOf: () => "url.validation.notOneOf",
    required: () => "url.validation.required",
  },
});

const validateUrl = (url, existedUrls) => {
  const schema = object({
    url: string().url().required().notOneOf(existedUrls),
  });
  return schema.validate({ url });
};

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get("url");
  validateUrl(url, watchedState.addedUrls)
    .then(() => {
      watchedState.form.url = url;
      watchedState.form.valid = true;
      watchedState.form.error = null;
      watchedState.addedUrls.push(url);
      e.target.reset();
      e.target.querySelector("input").focus();
    })
    .catch((err) => {
      watchedState.form.valid = false;
      watchedState.form.error = err.errors[0];
      console.error("Validation error:", err.errors);
    });
});

initView(watchedState);
