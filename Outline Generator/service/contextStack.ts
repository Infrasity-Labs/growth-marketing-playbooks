type Context = {
  User: {
    Id: string;
  };
};


class ContextStack {
  private stack: Context[];

  constructor() {
    this.stack = [];
  }

  push(context: Context): void {
    this.stack.push(context);
  }

  pop(): Context | undefined {
    return this.stack.pop();
  }

  peek(): Context | undefined {
    return this.stack[this.stack.length - 1];
  }

}

export const contextStack = new ContextStack();
