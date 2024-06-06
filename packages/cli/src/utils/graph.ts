export interface Node {
  name: string;
  inputs: Array<string>;
}

export function sort(graph: Array<Node>) {
  if (graph.length === 0) return;

  const kPushed = 0;
  const kVisited = 1;

  const visitedNode = new Array<number>(graph.length).fill(-1);
  const sortedNode = [];

  for (let i = 0; i < graph.length; ++i) {
    if (visitedNode[i] != -1) continue;

    const stack = [i];
    while (stack.length > 0) {
      const nodeIndex = stack.at(-1);

      if (nodeIndex == undefined) break;

      if (visitedNode[nodeIndex] == kPushed) {
        stack.pop();
        continue;
      }

      if (visitedNode[nodeIndex] == kVisited) {
        stack.pop();
        visitedNode[nodeIndex] = kPushed;
        sortedNode.push(nodeIndex);
        continue;
      }

      visitedNode[nodeIndex] = kVisited;

      const nodePtr = graph[nodeIndex];
      for (const edge of nodePtr.inputs) {
        const edgeIndex = graph.findIndex((node) => node.name === edge);
        if (edgeIndex === -1)
          throw new Error(
            `import ${edge} for program ${nodePtr.name} is not in 'programs' directory`
          );
        if (visitedNode[edgeIndex] != kVisited) stack.push(edgeIndex);
      }
    }
  }

  const outputs = [];
  for (const nodeIndex of sortedNode) outputs.push(graph[nodeIndex]);
  return outputs;
}
