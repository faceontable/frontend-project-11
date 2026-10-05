import { subscribe } from "valtio/vanilla";
import i18next from "i18next";

const initView = (watchedState) => {
  const search = document.querySelector("input");
  const feedback = document.querySelector(".feedback");

  const renderForm = () => {
    feedback.textContent = watchedState.form.error
      ? i18next.t(watchedState.form.error)
      : "";
    if (watchedState.form.valid) {
      search.classList.remove("border-red-500");
      search.classList.add("border-gray-300");
      feedback.classList.remove("text-red-400");
      feedback.classList.add("text-green-400");
    } else {
      search.classList.remove("border-gray-300");
      search.classList.add("border-red-500");
      feedback.classList.add("text-red-400");
      feedback.classList.remove("text-green-400");
    }
  };

  initFeeds(watchedState);
  initPosts(watchedState);
  initModal(watchedState);
  subscribe(watchedState.form, renderForm);
};

const initFeeds = (watchedState) => {
  const section = document.querySelector("#feeds-section");
  const feeds = document.querySelector("#feeds");

  const renderFeeds = () => {
    section.classList.toggle("hidden", watchedState.feeds.length === 0);
    feeds.innerHTML = "";

    watchedState.feeds.forEach((feed) => {
      const li = document.createElement("li");
      li.classList.add("py-4", "first:pt-0", "last:pb-0");

      const title = document.createElement("h3");
      title.textContent = feed.title;
      title.classList.add("font-bold", "text-xl", "text-slate-900", "mb-1");
      li.appendChild(title);

      const description = document.createElement("p");
      description.textContent = feed.description;
      description.classList.add("text-slate-600", "text-sm", "mb-0");
      li.appendChild(description);

      feeds.appendChild(li);
    });
  };

  subscribe(watchedState.feeds, renderFeeds);
};

const initPosts = (watchedState) => {
  const section = document.querySelector("#posts-section");
  const posts = document.querySelector("#posts");

  const renderPosts = () => {
    section.classList.toggle("hidden", watchedState.posts.length === 0);
    posts.innerHTML = "";

    watchedState.posts.forEach((post) => {
      const li = document.createElement("li");
      li.classList.add(
        "p-4",
        "flex",
        "justify-between",
        "items-center",
        "gap-4",
        "hover:bg-slate-50",
        "transition-colors",
      );
      li.dataset.seen = post.seen;

      const a = document.createElement("a");
      a.href = post.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = post.title;
      a.classList.add(
        post.seen ? "font-normal" : "font-bold",
        "text-blue-600",
        "hover:text-blue-800",
        "hover:underline",
        "text-base",
      );
      li.appendChild(a);

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = i18next.t("rss-aggregator.posts.button");
      button.classList.add(
        "px-4",
        "py-2",
        "bg-blue-600",
        "hover:bg-blue-700",
        "text-white",
        "font-medium",
        "text-sm",
        "rounded-md",
        "shadow-sm",
        "transition-colors",
        "shrink-0",
      );
      button.addEventListener("click", () => {
        post.seen = true;
        watchedState.dialog.postId = post.id;
      });
      li.appendChild(button);

      posts.appendChild(li);
    });
  };

  subscribe(watchedState.posts, renderPosts);
};

const initModal = (watchedState) => {
  document.querySelectorAll("[data-modal-close]").forEach((closeButton) =>
    closeButton.addEventListener("click", () => {
      watchedState.dialog.postId = null;
    }),
  );

  const renderDialog = () => {
    const { postId } = watchedState.dialog;
    const dialog = document.querySelector("dialog");

    if (postId === null) {
      dialog.close();
    } else {
      const post = watchedState.posts.find((p) => p.id === postId);

      const header = dialog.querySelector("[data-modal-title]");
      header.innerHTML = post.title;

      const content = dialog.querySelector("[data-modal-description]");
      content.innerHTML = post.content;

      const openPostButton = dialog.querySelector("[data-modal-link]");
      openPostButton.href = post.link;

      dialog.showModal();
    }
  };

  subscribe(watchedState.dialog, renderDialog);
};

export default initView;
