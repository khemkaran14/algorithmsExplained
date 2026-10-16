const quiz = [
  {
    id: 'mechanism',
    question: 'Which route wins among matching routes with different prefixes?',
    choices: [
      'The longest matching prefix',
      'Always the default route',
      'Whichever was typed last',
    ],
    answer: 0,
    explanation:
      'Canonical IPv4 routes use longest-prefix matching and declared tie priority. Internet-gateway traffic requires public mapping; NAT permits a mapped reply after outbound initiation. Local/peering paths and blackholes are separate route choices. Firewall policy and return-flow state are independent gates.',
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
      'Send outbound HTTPS through NAT, then compare its reply with a new unsolicited inbound packet. Add a more specific blackhole route and predict the selected path.',
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
      'This is a bounded five-tuple teaching model, not TCP, a complete NAT implementation or all AWS/GCP route precedence. NAT is not an inbound authorization mechanism.',
  },
];
export default quiz;
