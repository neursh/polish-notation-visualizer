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
  const stack: (string | number)[] = [];
  const keyChain = AppContext.keyList.get().join('');
  const tokens = keyChain.split(' ').filter((value) => value !== '');

  let infixNotation = '';
  infixNotation = InfixNormalBuilder.buildTree([...tokens]).infixExpression();

  let previousIsNumber = false;

  for (let index = 0; index < tokens.length; index++) {
    const value = tokens[index];

    if (AppContext.operators.includes(value)) {
      stack.push(value);
      console.log(stack);
      previousIsNumber = false;
    } else {
      stack.push(Number.parseFloat(value));

      if (previousIsNumber) {
        const [rightHandle, leftHandle, operator] = [
          stack.pop() as number,
          stack.pop() as number,
          stack.pop() as string,
        ];

        let thisResult = 0;
        let operationColor = '';

        if (operator === '+') {
          operationColor = 'blue';
          thisResult = leftHandle + rightHandle;
        }
        if (operator === '-') {
          operationColor = 'red';
          thisResult = leftHandle - rightHandle;
        }
        if (operator === '×') {
          operationColor = 'orange';
          thisResult = leftHandle * rightHandle;
        }
        if (operator === '/') {
          operationColor = '#cc66ff';
          thisResult = leftHandle / rightHandle;
        }
        if (operator === '%') {
          operationColor = '#cc66ff';
          thisResult = leftHandle % rightHandle;
        }

        thisResult = Math.round(thisResult * 10000) / 10000;

        let highlightArray: [number, string][] = [];
        highlightArray = [
          [stack.length, operationColor],
          [stack.length + 1, 'green'],
          [stack.length + 2, 'green'],
        ];
        const highlight = new Map<number, string>(highlightArray);

        stackStages.push({
          rawData: [
            ...stack,
            operator,
            leftHandle,
            rightHandle,
            ...tokens.slice(index + 1),
          ],
          calculationStartsAt: stack.length,
          calculationResult: thisResult,
          highlight: highlight,
          hint: [leftHandle, operator, rightHandle, '=', thisResult],
        });

        stack.push(thisResult);
      } else {
        previousIsNumber = true;
      }
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
