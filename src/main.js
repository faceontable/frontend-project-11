import "./style.css";
import { object, string, setLocale } from "yup";
import { proxy, subscribe } from "valtio/vanilla";
import initView from "./view.js";
import i18next from "i18next";
import { en, ru } from "./locales/index.js";
import axios from "axios";
import parseRSS from "./parser.js";
import locI18next from 'loc-i18next';

i18next.init({
  lng: "ru", // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en,
    ru,
  },
},()=>{
  const localize = locI18next.init(i18next, {
    selectorAttr: 'data-i18n', // имя атрибута (по умолчанию data-i18n)
    targetAttr: 'i18n-target',
    optionsAttr: 'i18n-options',
    useOptionsAttr: false,
    parseDefaultValueFromContent: true
  });
  localize('body');
});

const initialState = {
  addedUrls: [],
  feeds: [],
  posts: [],
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

const fetchFeed = () => {
  const url = watchedState.addedUrls.at(-1);
  axios
    .get(
      `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
    )
    .then(function (response) {
      const { feed, posts } = parseRSS(response.data.contents);
      const feedId = crypto.randomUUID();
      watchedState.feeds.push({ id: feedId, ...feed });
      posts.forEach((post) =>
        watchedState.posts.push({ id: crypto.randomUUID(), ...post, feedId }),
      );
    });
};
subscribe(watchedState.addedUrls, fetchFeed);

initView(watchedState);
