const quiz = [
  {
    id: 'mechanism',
    question: 'What should follow a partial apply failure?',
    choices: [
      'Refresh actual state and re-plan',
      'Assume every earlier action rolled back',
      'Delete the state file and guess',
    ],
    answer: 0,
    explanation:
      'A desired-state diff compares refreshed actual resources or stale recorded state. Region is immutable and produces replacement; size produces update. preventDestroy blocks the whole destructive plan before mutation. Apply can fail between resource operations; prior successful actions remain, and a refreshed follow-up plan resumes.',
  },
  {
    id: 'evidence',
    question: 'Which evidence best tests this lesson\u2019s design assumption?',
    choices: [
      'Change one declared workload or failure parameter and explain the resulting state.',
      'Treat the provider label as proof of correctness.',
      'Assume a clean diagram means production is healthy.',
    ],
    answer: 0,
    explanation:
      'Create drift between recorded and actual size, then compare refresh enabled and disabled. Inject failure before action one and inspect the remaining plan. Change region with preventDestroy enabled.',
  },
  {
    id: 'scope',
    question: 'What does running this exercise do?',
    choices: [
      'Provision the named cloud resources.',
      'Advance a bounded local model; validate real service behavior separately.',
      'Guarantee provider uptime and current pricing.',
    ],
    answer: 1,
    explanation:
      'No real resources, HCL parser, cloud credentials or deployment run. Dependency graphs, state locking, imports, provider retries and non-atomic replacement need further production design.',
  },
];
export default quiz;
