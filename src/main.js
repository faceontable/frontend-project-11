import "./style.css";
import { object, string } from "yup";
import { proxy, subscribe, snapshot } from "valtio/vanilla";
import initView from "./view.js";

const initialState = {
  addedUrls: [],
  form: {
    url: "",
    valid: true,
    error: null,
  },
};

const watchedState = proxy(initialState);

const validateUrl = (url, existedUrls) => {
  let schema = object({
    url: string()
      .url("Ссылка должна быть валидным URL")
      .required("Не должно быть пустым")
      .notOneOf(existedUrls, "RSS уже существует"),
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
