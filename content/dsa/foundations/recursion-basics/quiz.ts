const quiz = [
  {
    id: 'complexity',
    question: 'Which statement describes the cost or invariant here?',
    choices: [
      'O(n) time and O(n) stack',
      'All input sizes have the same total work.',
      'Visualization frames are processor instructions.',
    ],
    answer: 0,
    explanation:
      'Factorial makes n nested calls and n\u22121 multiplications. Its active call stack grows linearly with n.',
  },
  {
    id: 'invariant',
    question: 'Which step is necessary?',
    choices: [
      'Ignore the data representation.',
      'Push the current factorial call.',
      'Always discard the first item.',
    ],
    answer: 1,
    explanation: 'Push the current factorial call.',
  },
  {
    id: 'pitfall',
    question: 'Which limitation matters?',
    choices: [
      'A missing or unreachable base case prevents termination. Stack depth matters even when the arithmetic work is simple.',
      'All recursion needs constant stack space.',
      'All pointer strategies work on unsorted data.',
    ],
    answer: 0,
    explanation:
      'A missing or unreachable base case prevents termination. Stack depth matters even when the arithmetic work is simple.',
  },
];
export default quiz;
