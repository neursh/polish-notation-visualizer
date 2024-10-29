import AppContext, { IterationResult } from '../contextProvider';

class TreeNode {
  value: string;
  left: TreeNode | undefined;
  right: TreeNode | undefined;

  constructor(value: string) {
    this.value = value;
    this.left = undefined;
    this.right = undefined;
  }
}

class InfixNormalBuilder {
  root: TreeNode | undefined;

  constructor(root?: TreeNode) {
    this.root = root;
  }

  static buildTree(tokens: string[]) {
    const reversedToken = tokens.reverse();
    const stack: TreeNode[] = [];

    for (let index = 0; index < reversedToken.length; index++) {
      const value = reversedToken[index];

      if (AppContext.operators.includes(value)) {
        const node = new TreeNode(value);
        node.left = stack.pop();
        node.right = stack.pop();
        stack.push(node);
      } else {
        stack.push(new TreeNode(value));
      }
    }

    return new InfixNormalBuilder(stack.pop());
  }

  infixExpression(childRoot?: TreeNode): string {
    const root = childRoot ? childRoot : this.root;

    if (root) {
      if (root.value && AppContext.operators.includes(root.value)) {
        return `(${this.infixExpression(root.left)} ${
          root.value
        } ${this.infixExpression(root.right)})`;
      } else {
        return root.value;
      }
    } else {
      return '';
    }
  }
}

export function normalCalculate() {
  const stackStages: IterationResult[] = [];
  const stack: number[] = [];
  const keyChain = AppContext.keyList.get().join('');
  const tokens = keyChain.split(' ').filter((value) => value !== '');

  let infixNotation = '';
  infixNotation = InfixNormalBuilder.buildTree([...tokens]).infixExpression();

  for (let index = tokens.length - 1; index >= 0; index--) {
    const value = tokens[index];

    if (AppContext.operators.includes(value)) {
      const [leftHandle, rightHandle] = [
        stack.pop(),
        stack.pop(),
      ];

      if (
        Number.isNaN(rightHandle) ||
        Number.isNaN(leftHandle) ||
        !(rightHandle && leftHandle)
      ) {
        stackStages.push({
          rawData: ['undefined'],
          calculationStartsAt: 0,
          calculationResult: 'Error',
          highlight: new Map<number, string>([[0, 'red']]),
          hint: [leftHandle, value, rightHandle, '=', 'Error'],
        });

        AppContext.result.set(stackStages);
        AppContext.calculating.set(false);
        return;
      }

      let thisResult = 0;
      let operationColor = '';

      if (value === '+') {
        operationColor = 'blue';
        thisResult = leftHandle + rightHandle;
      }
      if (value === '-') {
        operationColor = 'red';
        thisResult = leftHandle - rightHandle;
      }
      if (value === '×') {
        operationColor = 'orange';
        thisResult = leftHandle * rightHandle;
      }
      if (value === '/') {
        operationColor = '#cc66ff';
        thisResult = leftHandle / rightHandle;
      }
      if (value === '%') {
        operationColor = '#cc66ff';
        thisResult = leftHandle % rightHandle;
      }

      thisResult = Math.round(thisResult * 10000) / 10000;

      let highlightArray: [number, string][] = [];
      highlightArray = [
        [index, operationColor],
        [index + 1, 'green'],
        [index + 2, 'green'],
      ];
      const highlight = new Map<number, string>(highlightArray);

      stackStages.push({
        rawData: [
          ...tokens.slice(0, index + 1),
          leftHandle,
          rightHandle,
          ...stack,
        ],
        calculationStartsAt: stack.length,
        calculationResult: thisResult,
        highlight: highlight,
        hint: [leftHandle, value, rightHandle, '=', thisResult],
      });

      stack.push(thisResult);
    } else {
      stack.push(Number.parseFloat(value));
    }
  }

  const final = stack.pop()!;

  stackStages.push({
    rawData: [final],
    calculationStartsAt: 0,
    calculationResult: final,
    highlight: new Map<number, string>([[0, 'green']]),
    hint: ['Result:', final],
  });

  // Add one more step to display infix notation.
  stackStages.push({
    rawData: [infixNotation, '=', final],
    calculationStartsAt: 0,
    calculationResult: final,
    highlight: new Map<number, string>([[2, 'green']]),
    hint: ['Infix form'],
  });

  AppContext.result.set(stackStages);
  AppContext.calculating.set(false);
  AppContext.displayingResult.set(true);
}
