const parseRSS = (content) => {
  const doc = new DOMParser().parseFromString(content, "application/xml");
  const channel = doc.querySelector("channel");
  const items = Array.from(channel.querySelectorAll("item")).map((item) => {
    return {
      title: item.querySelector("title").textContent,
      description: item.querySelector("description").textContent,
      link: item.querySelector("link").textContent,
      guid: item.querySelector("guid").textContent,
      creator: item.querySelector("creator").textContent,
      pubDate: item.querySelector("pubDate").textContent,
    };
  });
  return {
    feed: {
      title: channel.querySelector("title").textContent,
      description: channel.querySelector("description").textContent,
    },
    posts: items,
  };
};

export default parseRSS;
