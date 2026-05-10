export class Content {
    constructor(path) {
      this.path = path;
      this.view = '```meta-bind-embed\n[[content]]\n```';
      this.edit = '[[content|Modifier le contenu]]';
      this.isGenerated = false;
    }

    generate(mb, view) {
        this.isGenerated = true;
        this.mb = mb;
        this.viewMode = view;
    }

    render(view, internal, container) {
        if (!this.isGenerated || this.viewMode !== view) {
            this.generate(this.mb, view);
        }
        if (!view) {
            const inputWrapper = container.createEl('div', { cls: 'input-field content-input' });
            internal.renderMarkdown(this.edit, inputWrapper, this.path);
        } else {
            const viewWrapper = container.createEl('div', { cls: 'view-field content-view' });
            internal.renderMarkdown(this.view, viewWrapper, this.path);
        }
    }
}
