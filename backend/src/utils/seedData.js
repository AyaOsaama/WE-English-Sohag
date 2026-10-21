// Seed CONTENT only (courses, vocabulary, challenges, badges...). No fabricated student performance.
const q = (question, options, correctIndex, explanation = '') => ({ question, options, correctIndex, explanation });

const courses = [
  {
    title: 'Computer Networking', icon: '🌐', category: 'Networking', difficulty: 'Primary ATS', order: 1,
    description: 'Subnetting, routers, TCP/IP, OSI model, packet analysis and client-server interactions.',
    units: [
      {
        title: 'Network Basics', description: 'Core vocabulary for describing networks.',
        lessons: [
          { title: 'What Is a Network?', skill: 'reading', content: `## Describing a network\nA **network** is a group of connected computers and devices that can communicate with each other.\n\n## Key words\n- **node**: any device on a network\n- **server**: a computer that provides a service\n- **client**: a computer that uses a service\n- **packet**: a small unit of data\n\n## Useful sentences\n- "All computers in the lab are connected to the same network."\n- "The client sends a request and the server sends a response."`,
            quiz: [q('What is a packet?', ['A small unit of data', 'A type of cable', 'A web browser', 'A password'], 0, 'Data is split into packets before it travels.'), q('Which device provides a service?', ['Client', 'Server', 'Packet', 'Cable'], 1)] },
          { title: 'Bandwidth and Latency', skill: 'reading', content: `## Two different ideas\n- **Bandwidth** is the maximum amount of data that can travel through a connection in a given time (Mbps or Gbps). Think of the *width* of a highway.\n- **Latency** is the delay before data starts to arrive (milliseconds). Think of the *time* a car needs to cross the highway.\n\n## Useful sentences\n- "Fiber-optic cables provide higher bandwidth than copper."\n- "5G aims for latency under five milliseconds."`,
            quiz: [q('Latency is measured in...', ['Gbps', 'milliseconds', 'megabytes', 'volts'], 1), q('Which term describes maximum data capacity?', ['Latency', 'Bandwidth', 'Packet', 'Router'], 1)] },
          { title: 'Giving Simple Network Instructions', skill: 'grammar', content: `## Imperatives and polite requests\nUse the base verb to give instructions: "Restart the router." Add *please* or *could you* to be polite: "Could you check the cable?"\n\n## Simple past for finished actions\n"Yesterday I **configured** the switch." (not "I have configured" with *yesterday*)`,
            quiz: [q('Choose the correct sentence.', ['Yesterday I have configure the switch.', 'Yesterday I configured the switch.', 'Yesterday I configuring the switch.', 'Yesterday I configures the switch.'], 1, 'A finished past time (yesterday) takes the simple past.')] },
        ],
      },
      {
        title: 'Routing and Troubleshooting', description: 'IP routing and fixing connection problems.',
        lessons: [
          { title: 'IP Routing Fundamentals', content: `## What a router does\nA **router** forwards packets between networks. It reads the destination **IP address** and chooses the best path.\n\n## Key words\n- **subnet**, **gateway**, **routing table**, **hop**\n\n## Example\n"The router checks its routing table and forwards the packet to the next hop."` },
          { title: 'Network Troubleshooting Phrases', content: `## Reporting a problem\n- "The connection keeps dropping."\n- "I can't reach the server."\n- "Packets are being lost."\n\n## Describing your steps\n- "I checked the cable, then I restarted the router."\n- "The problem was caused by a wrong IP configuration."` },
        ],
      },
    ],
  },
  {
    title: 'Telecommunications & Fiber', icon: '📡', category: 'Telecom', difficulty: 'WE Core', order: 2,
    description: 'Cellular 4G/5G nodes, optical fiber splicing, microwave links and FTTH installations.',
    units: [
      {
        title: 'Telecommunications', description: 'Hardware and fiber vocabulary used at WE.',
        lessons: [
          { title: 'Telecom Hardware', skill: 'reading', content: `## Common equipment\n- **base station**: radio equipment that connects phones to the network\n- **tower**: a tall structure that holds antennas\n- **antenna**: sends and receives radio signals\n- **cabinet**: a metal box that protects equipment\n\n## Example\n"The engineer installed a new antenna on the tower."`,
            quiz: [q('What does an antenna do?', ['Cools equipment', 'Sends and receives radio signals', 'Stores files', 'Prints documents'], 1)] },
          { title: 'Fiber Optics', skill: 'reading', content: `## Light instead of electricity\n**Fiber-optic** cables send data as pulses of light through thin glass strands. They offer very high **bandwidth** and low **signal loss** over long distances.\n\n## Key words\n- **splice**: join two fibers together\n- **connector**, **core**, **attenuation**, **FTTH** (fiber to the home)`,
            quiz: [q('Fiber-optic cables send data as...', ['Pulses of light', 'Sound waves', 'Heat', 'Magnetic tape'], 0), q('What does "splice" mean?', ['To cut a cable', 'To join two fibers', 'To test a signal', 'To bury a cable'], 1)] },
          { title: 'Describing a Fiber Installation', skill: 'grammar', content: `## Passive voice in technical reports\nUse the passive when the action matters more than who did it.\n- "The cable **was installed** on Monday."\n- "Both fibers **were spliced** and tested."\n\nForm: *was/were + past participle*.`,
            quiz: [q('Which sentence is passive?', ['The team tested the link.', 'The link was tested by the team.', 'The team will test the link.', 'The team is testing the link.'], 1)] },
        ],
      },
    ],
  },
  {
    title: 'Programming English', icon: '💻', category: 'Programming', difficulty: 'Intermediate', order: 3,
    description: 'Syntax explanation, debugging language, API documentation and code reviews.',
    units: [{ title: 'Talking About Code', description: 'Explain and review code in English.', lessons: [
      { title: 'Explaining an Algorithm', content: `## Sequence words\nUse *first, then, next, finally* to describe steps.\n\n"First, the program reads the input. Then it sorts the list. Finally, it prints the result."` },
      { title: 'Describing Bugs', content: `## Useful phrases\n- "The function returns the wrong value."\n- "The program crashes when the input is empty."\n- "I fixed the bug by adding a null check."` },
      { title: 'Writing a Code Review Comment', skill: 'grammar', content: `## Be clear and polite\n- "Could you rename this variable to make it clearer?"\n- "This loop could be simplified."\n\nUse modal verbs (*could, should, might*) to sound polite.`,
        quiz: [q('Which comment is the most polite?', ['Change this now.', 'Could you rename this variable?', 'This is wrong.', 'Rename it.'], 1)] },
    ] }],
  },
  {
    title: 'Cybersecurity & SecOps', icon: '🛡️', category: 'Cybersecurity', difficulty: 'Intermediate', order: 4,
    description: 'Firewalls, encryption, vulnerability reports and defensive security.',
    units: [{ title: 'Security Fundamentals', description: 'Describe threats and defenses.', lessons: [
      { title: 'Cybersecurity Vocabulary', content: `## Key words\n- **threat**, **vulnerability**, **attack**, **breach**\n- **firewall**: filters network traffic using security rules\n- **encryption**: turns data into unreadable code\n\n"Every telecom engineer must follow strict cybersecurity protocols."` },
      { title: 'Incident Response Terminology', content: `## Reporting a security incident\n1. "We detected unusual traffic at 02:15."\n2. "We isolated the affected server."\n3. "We restored the system from a clean backup."\n\nUse the simple past to report what already happened.` },
    ] }],
  },
  {
    title: 'Artificial Intelligence & ML', icon: '🧠', category: 'AI', difficulty: 'Advanced', order: 5,
    description: 'Neural networks, datasets, inference and ethical AI in English.',
    units: [{ title: 'AI Basics', description: 'Explain AI simply.', lessons: [
      { title: 'What Is Artificial Intelligence?', content: `## A simple definition\n**Artificial intelligence** is technology that lets machines perform tasks that normally need human intelligence.\n\n## Key words\n- **machine learning**, **training data**, **model**, **inference**` },
      { title: 'Explaining Machine Learning', content: `## Cause and result\n"The model learns patterns **from** training data, so it can make predictions on new data."\n\nUse *because, so, therefore* to connect ideas.` },
    ] }],
  },
  {
    title: 'Digital Electronics & IoT', icon: '⚡', category: 'Electronics', difficulty: 'Foundational', order: 6,
    description: 'Circuit schematics, microcontrollers, sensors and soldering specs.',
    units: [{ title: 'Electronics Basics', description: 'Components and circuits.', lessons: [
      { title: 'Circuit Components', content: `## Key words\n- **resistor**, **capacitor**, **sensor**, **microcontroller**, **voltage**, **current**\n\n"The sensor sends a signal to the microcontroller."` },
      { title: 'Reading a Schematic', content: `## Describing a diagram\n- "The resistor is connected to pin 5."\n- "Current flows from the battery to the LED."` },
    ] }],
  },
  {
    title: 'Workplace & Technical Communication', icon: '💼', category: 'Career', difficulty: 'Career Essential', order: 7,
    description: 'Professional emails, client demos, explaining troubleshooting and hiring interviews.',
    units: [{ title: 'Professional Communication', description: 'Prepare for Telecom Egypt placement.', lessons: [
      { title: 'Writing a Professional Email', skill: 'reading', content: `## Structure\n1. Greeting: "Dear Mr. Hassan,"\n2. Purpose: "I am writing to ask about..."\n3. Details\n4. Closing: "Thank you for your time. Best regards,"`,
        quiz: [q('Which is a professional opening?', ['Hey!', 'Dear Mr. Hassan,', 'Yo manager,', 'Listen,'], 1)] },
      { title: 'Answering Interview Questions (STAR)', content: `## The STAR method\n- **S**ituation: describe the context\n- **T**ask: what you had to do\n- **A**ction: what you did\n- **R**esult: what happened\n\n"The internet was slow in our lab (S). I had to find the cause (T). I tested each cable and replaced a damaged one (A). Speed returned to normal (R)."` },
      { title: 'Explaining a Problem to a Non-Technical Person', content: `## Keep it simple\nAvoid jargon. Compare with everyday things.\n"Bandwidth is like the width of a road: a wider road lets more cars pass."` },
    ] }],
  },
];

const vocabulary = [
  ['Network', '/ˈnɛtwəːk/', 'NETWORKING', 'A group of connected computers and devices that can communicate with each other.', 'شَبَكَة (شبكة اتصالات أو حواسب)', 'All computers in the laboratory are connected to the same network.', 'easy'],
  ['Bandwidth', '/ˈbandwɪdθ/', 'TELECOMMUNICATIONS', 'The maximum amount of data transmitted over an internet connection in a given amount of time.', 'عَرْض النِطَاق الترددي (سعة نقل البيانات)', 'Fiber-optic cables provide significantly higher bandwidth than copper wires.', 'medium'],
  ['Cybersecurity', '/ˌsʌɪbəsɪˈkjʊərɪti/', 'CYBERSECURITY', 'The practice of protecting systems, networks, and programs from digital attacks.', 'الأَمْن السِيبِرَانِي (حماية الأنظمة الرقمية)', 'Every telecom engineer at WE must follow strict cybersecurity protocols.', 'medium'],
  ['Algorithm', '/ˈalɡərɪð(ə)m/', 'PROGRAMMING / AI', 'A step-by-step procedure or set of rules to solve a specific problem or perform computation.', 'خُوارِزْمِيّة (خطوات حل مسألة برمجية)', 'The search algorithm sorts packet headers in microseconds.', 'medium'],
  ['Latency', '/ˈleɪt(ə)nsi/', 'TELECOMMUNICATIONS', 'The delay before a transfer of data begins following an instruction for its transfer.', 'زَمَن الإِسْتِجَابَة أو التَأْخِير', '5G networks aim for ultra-low latency under 5 milliseconds.', 'medium'],
  ['Router', '/ˈruːtə/', 'NETWORKING', 'A device that forwards data packets between computer networks.', 'مُوَجِّه (جهاز توجيه الشبكات)', 'The router sends each packet to the correct network.', 'easy'],
  ['Packet', '/ˈpakɪt/', 'NETWORKING', 'A small unit of data sent across a network.', 'حُزْمَة بيانات', 'The file was split into thousands of packets.', 'easy'],
  ['Protocol', '/ˈprəʊtəkɒl/', 'NETWORKING', 'A set of rules that defines how devices communicate.', 'بروتوكول (مجموعة قواعد للاتصال)', 'HTTP is a protocol used by web browsers.', 'medium'],
  ['Firewall', '/ˈfʌɪəwɔːl/', 'CYBERSECURITY', 'A security system that monitors and filters network traffic using rules.', 'جدار ناري', 'The firewall blocked the suspicious connection.', 'medium'],
  ['Encryption', '/ɪnˈkrɪpʃn/', 'CYBERSECURITY', 'Turning data into a coded form so only authorized people can read it.', 'تشفير', 'All customer data is protected with encryption.', 'medium'],
  ['Vulnerability', '/ˌvʌln(ə)rəˈbɪlɪti/', 'CYBERSECURITY', 'A weakness that an attacker could exploit.', 'ثغرة أمنية', 'The team found a vulnerability in the login page.', 'hard'],
  ['Fiber Optic', '/ˈfʌɪbə ˈɒptɪk/', 'TELECOMMUNICATIONS', 'A cable that transmits data as pulses of light through glass strands.', 'ألياف ضوئية', 'The company installed fiber optic cable in the whole district.', 'medium'],
  ['Splice', '/splʌɪs/', 'TELECOMMUNICATIONS', 'To join two cables or fibers together.', 'وَصْل (ربط ألياف أو كابلات)', 'He spliced the two fibers and tested the signal.', 'hard'],
  ['Antenna', '/anˈtɛnə/', 'TELECOMMUNICATIONS', 'A device that sends and receives radio signals.', 'هوائي', 'A new antenna was mounted on the tower.', 'easy'],
  ['Signal', '/ˈsɪɡn(ə)l/', 'TELECOMMUNICATIONS', 'A wave or pulse that carries information.', 'إشارة', 'The signal is weak inside the building.', 'easy'],
  ['Server', '/ˈsɜːvə/', 'NETWORKING', 'A computer that provides data or services to other computers.', 'خادم', 'The web server responded in 20 milliseconds.', 'easy'],
  ['Debug', '/diːˈbʌɡ/', 'PROGRAMMING / AI', 'To find and fix errors in a program.', 'تصحيح الأخطاء البرمجية', 'I spent an hour trying to debug the function.', 'medium'],
  ['Variable', '/ˈvɛːrɪəb(ə)l/', 'PROGRAMMING / AI', 'A named place in memory that stores a value.', 'مُتَغَيِّر', 'The variable "count" stores the number of users.', 'easy'],
  ['Dataset', '/ˈdeɪtəsɛt/', 'PROGRAMMING / AI', 'A collection of data used for analysis or training a model.', 'مجموعة بيانات', 'The model was trained on a large dataset.', 'medium'],
  ['Inference', '/ˈɪnf(ə)r(ə)ns/', 'PROGRAMMING / AI', 'Using a trained model to make predictions on new data.', 'الاستدلال (تنبؤ النموذج)', 'Inference takes only a few milliseconds.', 'hard'],
  ['Sensor', '/ˈsɛnsə/', 'ELECTRONICS', 'A device that detects physical changes such as heat or light.', 'مُسْتَشْعِر', 'The temperature sensor sends data to the microcontroller.', 'easy'],
  ['Voltage', '/ˈvəʊltɪdʒ/', 'ELECTRONICS', 'The electrical force that pushes current through a circuit.', 'جُهْد كهربائي', 'The circuit works at five volts.', 'medium'],
  ['Microcontroller', '/ˌmʌɪkrəʊkənˈtrəʊlə/', 'ELECTRONICS', 'A small computer on a single chip used to control devices.', 'مُتَحَكِّم دقيق', 'The Arduino is a popular microcontroller board.', 'hard'],
  ['Deadline', '/ˈdɛdlʌɪn/', 'WORKPLACE', 'The time by which a task must be finished.', 'موعد نهائي', 'We must finish the report before the deadline.', 'easy'],
  ['Stakeholder', '/ˈsteɪkhəʊldə/', 'WORKPLACE', 'A person or group with an interest in a project.', 'صاحب مصلحة', 'We updated all stakeholders about the network upgrade.', 'hard'],
].map(([word, phonetic, category, definition, arabicMeaning, example, difficulty]) => ({ word, phonetic, category, definition, arabicMeaning, example, difficulty }));

const speakingChallenges = [
  { title: 'Explain Artificial Intelligence', description: 'Mention machine learning, training data, and practical telecom applications at Telecom Egypt.', prompt: 'Explain what Artificial Intelligence is in 60 seconds.', timeLimit: 60, xpReward: 40, difficulty: 'medium' },
  { title: 'Your Favorite Programming Language', description: 'Discuss Python or C++, readability, execution speed, and microcontroller control.', prompt: 'Describe your favorite programming language.', timeLimit: 60, xpReward: 40, difficulty: 'medium' },
  { title: 'How a Computer Network Works', description: 'Mention packets, IP addresses, routers, switches, and the client-server model.', prompt: 'Explain how a computer network works.', timeLimit: 60, xpReward: 40, difficulty: 'hard' },
  { title: 'Your Favorite Technology', description: 'Use at least 3 technical adjectives (for example: scalable, automated, reliable).', prompt: 'Speak for 60 seconds about your favorite technology.', timeLimit: 60, xpReward: 40, difficulty: 'easy' },
];

const challenges = [
  { title: 'Speak for 60 seconds about your favorite technology', description: 'Record your voice in the Speaking Lab. Focus on clear pronunciation and technical vocabulary.', type: 'speaking', requirement: { target: 1 }, xpReward: 50 },
  { title: 'Review 5 vocabulary flashcards', description: 'Test your recall of technical terms in the Vocabulary deck.', type: 'vocabulary', requirement: { target: 5 }, xpReward: 30 },
  { title: 'Practice with the AI Tutor', description: 'Send at least 3 messages to the AI Tutor, for example in the interview mode.', type: 'ai', requirement: { target: 3 }, xpReward: 40 },
  { title: 'Complete a lesson', description: 'Finish any lesson in Tech English.', type: 'lesson', requirement: { target: 1 }, xpReward: 25 },
];

const badges = [
  { name: 'First Conversation', description: 'Started your first AI Tutor conversation', icon: '💬', requirementType: 'aiConversations', requirementValue: 1, xpReward: 10 },
  { name: 'Tech English Starter', description: 'Completed your first 5 lessons', icon: '📡', requirementType: 'completedLessons', requirementValue: 5, xpReward: 25 },
  { name: 'Speaking Explorer', description: 'Completed 3 speaking challenges', icon: '🎙️', requirementType: 'completedSpeaking', requirementValue: 3, xpReward: 30 },
  { name: 'Vocabulary Starter', description: 'Mastered 20 technical words', icon: '📇', requirementType: 'masteredVocabulary', requirementValue: 20, xpReward: 30 },
  { name: '100 Words', description: 'Mastered 100 technical words', icon: '💯', requirementType: 'masteredVocabulary', requirementValue: 100, xpReward: 100 },
  { name: '7-Day Streak Master', description: 'Practiced English 7 days in a row', icon: '🔥', requirementType: 'streak', requirementValue: 7, xpReward: 50 },
  { name: 'Challenge Hunter', description: 'Completed 5 daily challenges', icon: '🎯', requirementType: 'completedChallenges', requirementValue: 5, xpReward: 40 },
  { name: 'XP Climber', description: 'Earned 500 XP', icon: '⚡', requirementType: 'totalXP', requirementValue: 500, xpReward: 0 },
];

const announcement = {
  title: 'Speaking exam for graduation projects',
  content: 'سيعقد اختبار المحادثة الشفهي الخاص بمشاريع التخرج للتكنولوجيا التطبيقية خلال الأسبوع القادم. يرجى التركيز على وحدة Workplace English.',
  targetAudience: 'students',
};

module.exports = { courses, vocabulary, speakingChallenges, challenges, badges, announcement };
