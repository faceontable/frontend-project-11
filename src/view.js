import { subscribe } from "valtio/vanilla";

const initView = (watchedState) => {
  const search = document.querySelector("input");
  const feedback = document.querySelector(".feedback");

  const renderForm = () => {
    feedback.textContent = watchedState.form.error;
    if (watchedState.form.valid) {
      search.classList.remove("border-red-500");
      search.classList.add("border-gray-300");
      feedback.classList.remove("text-red-500");
      feedback.classList.add("text-slate-300");
    } else {
      search.classList.remove("border-gray-300");
      search.classList.add("border-red-500");
      feedback.classList.add("text-red-500");
      feedback.classList.remove("text-slate-300");
    }
  };
  subscribe(watchedState.form, renderForm);
};

export default initView;
