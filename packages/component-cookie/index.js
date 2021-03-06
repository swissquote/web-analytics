/* eslint-disable no-param-reassign */
export default function api(key, value, attributes) {
  // Write
  if (arguments.length > 1) {
    api.set(key, value, attributes);
  }

  // Read
  return api.get(key);
}

api.set = function(key, value, attributes) {
  attributes = attributes || {};
  if (!attributes.path) {
    attributes.path = "/";
  }

  if (value == null) {
    attributes.maxage = -1;
  }

  if (attributes.maxage) {
    attributes.expires = new Date(+new Date() + attributes.maxage);
  }

  if (typeof attributes.expires === "number") {
    attributes.expires = new Date(+new Date() + attributes.expires);
  }

  try {
    const result = JSON.stringify(value);
    if (/^[\{\[]/.test(result)) {
      value = result;
    }
  } catch (e) {
    // Json couldn't stringify ... can't do much about it
  }

  value = encodeURIComponent(String(value)).replace(
    /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
    decodeURIComponent
  );

  key = encodeURIComponent(String(key))
    .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
    .replace(/[\(\)]/g, escape);

  let stringifiedAttributes = "";
  if (attributes.path) {
    stringifiedAttributes += `; path=${attributes.path}`;
  }
  if (attributes.domain) {
    stringifiedAttributes += `; domain=${attributes.domain}`;
  }
  if (attributes.expires) {
    stringifiedAttributes += `; expires=${attributes.expires.toUTCString()}`;
  }
  if (attributes.secure) {
    stringifiedAttributes += "; secure";
  }

  document.cookie = `${key}=${value}${stringifiedAttributes}`;
};

api.get = function(key) {
  const jar = {};
  const decode = function(s) {
    return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
  };
  // To prevent the for loop in the first place assign an empty array
  // in case there are no cookies at all.
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  let i = 0;

  for (; i < cookies.length; i++) {
    const parts = cookies[i].split("=");
    let cookie = parts.slice(1).join("=");

    try {
      const name = decode(parts[0]);
      cookie = decode(cookie);

      try {
        cookie = JSON.parse(cookie);
      } catch (e) {
        if (cookie.charAt(0) === '"') {
          cookie = cookie.slice(1, -1);
        }
      }

      jar[name] = cookie;

      if (key === name) {
        break;
      }
    } catch (e) {
      // Meh
    }
  }

  return key ? jar[key] : jar;
};

api.remove = function(key, attributes = {}) {
  attributes.expires = -1;
  api.set(key, "", attributes);
};
