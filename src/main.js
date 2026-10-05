import "./style.css";
import { object, string, setLocale } from "yup";
import { proxy, subscribe } from "valtio/vanilla";
import initView from "./view.js";
import i18next from "i18next";
import { en, ru } from "./locales/index.js";
import axios from "axios";
import parseRSS from "./parser.js";
import locI18next from "loc-i18next";

i18next.init(
  {
    lng: "ru",
    debug: true,
    resources: {
      en,
      ru,
    },
  },
  () => {
    const localize = locI18next.init(i18next, {
      selectorAttr: "data-i18n", // имя атрибута (по умолчанию data-i18n)
      targetAttr: "i18n-target",
      optionsAttr: "i18n-options",
      useOptionsAttr: false,
      parseDefaultValueFromContent: true,
    });
    localize("body");
  },
);

const app = () => {
  const initialState = {
    addedUrls: [],
    feeds: [],
    posts: [],
    form: {
      url: "",
      valid: true,
      error: null,
    },
    dialog: {
      postId: null,
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

  const loadFeed = (url) => {
    return axios
      .get(
        `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
      )
      .then(function (response) {
        const parsed = parseRSS(response.data.contents);
        const feedId = crypto.randomUUID();
        const feed = { id: feedId, ...parsed.feed, url };
        const posts = parsed.posts.map((post) => {
          return { id: crypto.randomUUID(), ...post, feedId, seen: false };
        });

        return { feed, posts };
      });
  };

  const fetchFeed = () => {
    const url = watchedState.addedUrls.at(-1);
    loadFeed(url)
      .then(({ feed, posts }) => {
        watchedState.feeds.push(feed);
        watchedState.posts.push(...posts);
        watchedState.form.valid = true;
        watchedState.form.error = "rss-aggregator.form.feedback.success";
      })
      .catch((err) => {
        watchedState.form.valid = false;
        watchedState.form.error = err.isValidationError
          ? "rss-aggregator.form.feedback.invalidRss"
          : "rss-aggregator.form.feedback.error";
        console.error("Fetch or parse error:", err);
      });
  };

  subscribe(watchedState.addedUrls, fetchFeed);

  const updateFeed = () => {
    Promise.allSettled(
      watchedState.feeds.map(async (storedFeed) => {
        try {
          const { posts } = await loadFeed(storedFeed.url);
          posts.forEach((post) => {
            const storedPosts = watchedState.posts.filter(
              (storedPost) => storedPost.guid === post.guid,
            );
            if (storedPosts.length === 0) {
              watchedState.posts.push({ ...post, feedId: storedFeed.id });
            }
          });
        } catch (err) {
          console.error("Fetch or parse error:", err);
        }
      }),
    ).finally(() => {
      setTimeout(updateFeed, 5000);
    });
  };

  updateFeed();
  initView(watchedState);
};

app();

export default app;
