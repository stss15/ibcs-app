export function classNames(...inputs) {
  const classes = [];

  const process = (value) => {
    if (!value) return;
    if (typeof value === "string") {
      classes.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(process);
      return;
    }
    if (typeof value === "object") {
      for (const [key, condition] of Object.entries(value)) {
        if (condition) classes.push(key);
      }
    }
  };

  inputs.forEach(process);

  return classes.join(" ");
}

export default classNames;

