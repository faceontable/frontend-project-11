const parseRSS = (content) => {
  const doc = new DOMParser().parseFromString(content, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    const error = new Error("Parsing error");
    error.isValidationError = true;
    throw error;
  }
  const channel = doc.querySelector("channel");
  if (!channel) {
    const error = new Error("No RSS channel found");
    error.isValidationError = true;
    throw error;
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
