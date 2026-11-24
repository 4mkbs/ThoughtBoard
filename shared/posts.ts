// Shared between the Electron main process and the web build
export interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

export const DEFAULT_POSTS: Post[] = [
  {
    id: 'book-1',
    title: 'The Great Gatsby (F. Scott Fitzgerald)',
    content: 'Set in the roaring twenties, this classic explores themes of wealth, love, and class. The story is narrated by Nick Carraway, who becomes entangled in the life of his neighbor, the mysterious Jay Gatsby. Gatsby is obsessed with reuniting with his former love, Daisy Buchanan. The novel serves as a critique of the American Dream, showing that wealth alone cannot buy happiness or erase the past.',
    author: 'classic_library',
    createdAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString()
  },
  {
    id: 'book-2',
    title: 'The Art of War (Sun Tzu)',
    content: 'An ancient Chinese military treatise attributed to Sun Tzu. The book contains 13 chapters, each dedicated to a different aspect of warfare and military strategy. Its core philosophy is that winning without fighting is the ultimate achievement. It emphasizes flexibility, knowing the enemy, and using deception, making it highly influential in modern business and leadership.',
    author: 'sun_tzu',
    createdAt: new Date(Date.now() - 3600000 * 24 * 19).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 19).toISOString()
  },
  {
    id: 'book-3',
    title: 'A Brief History of Time (Stephen Hawking)',
    content: 'Stephen Hawking explains complex cosmological concepts like the Big Bang, black holes, and light cones to non-specialists. The book traces the history of scientific models of the universe from Ptolemy and Copernicus to general relativity and quantum mechanics. Hawking seeks to answer fundamental questions about the origin and ultimate fate of our universe.',
    author: 'science_hub',
    createdAt: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 18).toISOString()
  },
  {
    id: 'book-4',
    title: 'Clean Code (Robert C. Martin)',
    content: 'This programming classic emphasizes writing readable and maintainable code. Robert C. Martin argues that code is clean if it is easy to understand and easy to change. He introduces principles for naming, writing compact functions, error handling, unit testing, and refactoring, teaching developers that good code requires craftsmanship.',
    author: 'clean_code_bot',
    createdAt: new Date(Date.now() - 3600000 * 24 * 17).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 17).toISOString()
  },
  {
    id: 'book-5',
    title: 'Atomic Habits (James Clear)',
    content: 'James Clear presents a framework for building good habits and breaking bad ones. He argues that tiny changes (atomic habits) compound over time to produce massive results. The book is built around the Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying, focusing on identity-based habit building.',
    author: 'self_improve',
    createdAt: new Date(Date.now() - 3600000 * 24 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 16).toISOString()
  },
  {
    id: 'book-6',
    title: '1984 (George Orwell)',
    content: 'A classic dystopian novel set in a totalitarian state ruled by Big Brother. The protagonist, Winston Smith, works for the Ministry of Truth, rewriting history to suit the Party\'s narrative. He rebels by starting a secret diary and entering a relationship with Julia. The book warns against government surveillance, psychological control, and the manipulation of truth.',
    author: 'dystopia_reader',
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
  },
  {
    id: 'book-7',
    title: 'Sapiens: A Brief History of Humankind (Yuval Noah Harari)',
    content: 'Yuval Noah Harari surveys the history of human species, Homo sapiens, from the stone age to the 21st century. He explores three major revolutions: Cognitive, Agricultural, and Scientific. Harari argues that what makes Sapiens unique is our ability to create and believe in shared myths, such as money, religion, and nations, which allow us to cooperate in large numbers.',
    author: 'history_buff',
    createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString()
  },
  {
    id: 'book-8',
    title: 'Thinking, Fast and Slow (Daniel Kahneman)',
    content: 'Nobel laureate Daniel Kahneman explains the two systems that drive the way we think. System 1 is fast, intuitive, and emotional. System 2 is slower, more deliberative, and logical. Kahneman details cognitive biases and heuristics, showing how we make decisions under uncertainty and where our logical thinking often fails us.',
    author: 'psych_student',
    createdAt: new Date(Date.now() - 3600000 * 24 * 13).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 13).toISOString()
  },
  {
    id: 'book-9',
    title: 'The Lean Startup (Eric Ries)',
    content: 'Eric Ries introduces a methodology for building successful startups in conditions of extreme uncertainty. He proposes the Build-Measure-Learn feedback loop. Startups should build a Minimum Viable Product (MVP) to test hypotheses, measure customer response, and learn whether to pivot (change direction) or persevere, reducing wasted resources.',
    author: 'startup_founder',
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString()
  },
  {
    id: 'book-10',
    title: 'Meditations (Marcus Aurelius)',
    content: 'A collection of personal writings by Roman Emperor Marcus Aurelius, recorded as private notes to himself. The book is a cornerstone of Stoic philosophy, focusing on self-discipline, duty, logic, and acceptance of death. Marcus Aurelius counsels himself on how to maintain inner peace, control his emotional reactions, and act with virtue despite the chaos of leadership.',
    author: 'stoic_mind',
    createdAt: new Date(Date.now() - 3600000 * 24 * 11).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 11).toISOString()
  },
  {
    id: 'book-11',
    title: 'The Alchemist (Paulo Coelho)',
    content: 'An allegorical novel about Santiago, an Andalusian shepherd boy who dreams of finding treasure in the Egyptian pyramids. Along his journey, he learns about listening to his heart, reading omens scattered along life\'s path, and understanding the Soul of the World. The novel emphasizes the importance of pursuing one\'s Personal Legend (destiny).',
    author: 'dream_seeker',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    id: 'book-12',
    title: 'Deep Work (Cal Newport)',
    content: 'Cal Newport argues that the ability to focus without distraction (deep work) is becoming increasingly rare and valuable in our modern economy. He contrasts deep work with shallow work (emails, meetings, social media) and provides rules for training focus, embracing boredom, quitting social media, and draining the shallows to achieve cognitive depth.',
    author: 'productivity_hacks',
    createdAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString()
  },
  {
    id: 'book-13',
    title: 'Zero to One (Peter Thiel)',
    content: 'Peter Thiel offers a philosophy on startup strategy and innovation. He argues that true progress comes from going from zero to one (creating something completely new and monopolistic) rather than one to n (copying existing models globally). Thiel outlines critical business questions regarding technology, timing, monopoly, team, and distribution.',
    author: 'venture_capital',
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
  },
  {
    id: 'book-14',
    title: 'Design Patterns (Erich Gamma et al.)',
    content: 'Often referred to as the "Gang of Four" book, this software engineering classic defines 23 reusable solutions to common software design problems. It divides patterns into three categories: Creational (e.g., Singleton, Factory), Structural (e.g., Adapter, Decorator), and Behavioral (e.g., Observer, Strategy), establishing a common vocabulary for developers.',
    author: 'pattern_architect',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    id: 'book-15',
    title: 'The Pragmatic Programmer (Andy Hunt & Dave Thomas)',
    content: 'A guide filled with practical advice for programmers to improve their craft. It covers topics like career development, personal responsibility, keeping code DRY (Don\'t Repeat Yourself), writing flexible code, testing, and debugging. It teaches that being pragmatic means taking control of your career and focusing on continuous learning.',
    author: 'coding_wisdom',
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    id: 'book-16',
    title: 'Siddhartha (Hermann Hesse)',
    content: 'A novel about the spiritual journey of self-discovery of a man named Siddhartha during the time of the Gautama Buddha. Siddhartha leaves his wealthy home to find enlightenment, experiencing asceticism, sensual love, wealth, and eventually finding wisdom by a river, learning that truth cannot be taught but must be experienced.',
    author: 'spiritual_read',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'book-17',
    title: 'The Selfish Gene (Richard Dawkins)',
    content: 'Richard Dawkins proposes a gene-centric view of evolution. He argues that natural selection operates on genes, not individuals or species, and that organisms are "survival machines" built to propagate genes. Dawkins also introduces the concept of the "meme" to explain how cultural information spreads and evolves analogous to genes.',
    author: 'science_hub',
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: 'book-18',
    title: 'Smarter Faster Better (Charles Duhigg)',
    content: 'Charles Duhigg explores the science of productivity. He identifies eight key concepts, including motivation, teams (psychological safety), focus, and decision making, that explain how some people and companies get so much done. Duhigg shows that productivity is about making choices in specific ways to govern our minds and energy.',
    author: 'self_improve',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'book-19',
    title: 'Crime and Punishment (Fyodor Dostoevsky)',
    content: 'A psychological novel following Rodion Raskolnikov, a poor former student in St. Petersburg, who plans and executes the murder of an unscrupulous pawnbroker. Raskolnikov believes his intellect justifies the crime, but he is consumed by guilt and paranoia. The novel details his psychological suffering and eventual redemption through love and faith.',
    author: 'classic_library',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'book-20',
    title: 'Man\'s Search for Meaning (Viktor Frankl)',
    content: 'Psychiatrist Viktor Frankl describes his experiences in Nazi concentration camps, including Auschwitz. He uses these observations to outline Logotherapy, his psychotherapeutic method. Frankl argues that we cannot avoid suffering, but we can choose how to cope with it, find meaning in it, and move forward with renewed purpose.',
    author: 'stoic_mind',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  }
]
