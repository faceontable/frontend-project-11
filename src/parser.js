const parseRSS = (content) => {
  const doc = new DOMParser().parseFromString(content, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Parsing error");
  }
  const channel = doc.querySelector("channel");
  if (!channel) {
    throw new Error("No RSS channel found");
  }

  const items = Array.from(channel.querySelectorAll("item")).map((item) => {
    return {
      title: item.querySelector("title")?.textContent ?? "",
      description: item.querySelector("description")?.textContent ?? "",
      link: item.querySelector("link")?.textContent ?? "",
      guid: item.querySelector("guid")?.textContent ?? "",
    };
  });

  return {
    feed: {
      title: channel.querySelector("title")?.textContent ?? "",
      description: channel.querySelector("description")?.textContent ?? "",
    },
    posts: items,
  };
};

export default parseRSS;
