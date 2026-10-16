const quiz = [
  {
    id: 'mechanism',
    question: 'Which data is included in the modeled snapshot?',
    choices: [
      'Flushed durable blocks',
      'Every dirty VM buffer',
      'Future writes after the snapshot',
    ],
    answer: 0,
    explanation:
      'A zonal volume has an attachment owner, durable blocks and per-VM dirty buffers. Flush copies buffered blocks to durable data; a crash loses unflushed data. A snapshot copies durable blocks into a replacement generation which starts unattached. The unsafe multiwriter switch demonstrates ownership hazards.',
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
      'Write a block without flushing and crash the owner. Compare it with flush then crash, and try attaching from another zone.',
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
      'No real block device is accessed. Multi-attach capabilities, filesystem coordination, IOPS, disk types and cross-zone recovery differ by product; this model defaults to a single writer.',
  },
];
export default quiz;
