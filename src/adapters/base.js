export class BaseAdapter {
  get name() {
    throw new Error("Adapter must implement name getter");
  }

  matches() {
    throw new Error("Must implement matches()");
  }

  extractMetadata() {
    throw new Error("Must implement extractMetadata()");
  }

  getCommentContainer() {
    const container = document.createElement("div");
    container.className = `${this.name}-comments`;
    document.body.appendChild(container);
    return container;
  }

  applyTheme(element) {
    element.style.fontFamily = "system-ui, sans-serif";
  }
}
