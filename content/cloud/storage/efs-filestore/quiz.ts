const quiz = [
  {
    id: 'mechanism',
    question:
      'Should a network partition alone release a possibly live client\u2019s lock?',
    choices: [
      'No',
      'Yes, absence proves the client stopped',
      'Yes, all locks expire immediately',
    ],
    answer: 0,
    explanation:
      'Clients remember read values before application-level read-modify-write. Uncoordinated writes can lose a concurrent update. Cooperative advisory locks read the current value before appending; a metadata compare-and-set mode rejects a stale epoch. A network partition does not prove the lock owner is dead.',
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
      'Have two clients read the same epoch and append different suffixes. Compare unsafe overwrite, cooperative locking and a rejected stale CAS. Block a lock holder and decide what evidence is needed before releasing ownership.',
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
      'The metadata CAS is an application abstraction, not a claim that NFS offers an atomic compare-and-append API. Real locks, leases, mounts and cache consistency require product-specific analysis.',
  },
];
export default quiz;
