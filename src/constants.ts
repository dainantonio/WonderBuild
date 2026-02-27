import { ProjectTemplate } from "./types";

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'story',
    name: 'Story Builder',
    description: 'Write a magical tale, a space adventure, or a funny comic!',
    icon: 'BookOpen',
    steps: [
      { id: 'title', question: "What should we call your story?", field: 'title' },
      { id: 'theme', question: "What kind of story is it? (e.g. Space, Magic, Animals)", field: 'theme' },
      { id: 'characters', question: "Who is the main character? Tell me their name and one cool thing about them.", field: 'characters' },
      { id: 'goal', question: "What is your character trying to do?", field: 'goal' },
      { id: 'challenge', question: "What is the big problem they have to solve?", field: 'challenge' },
    ]
  },
  {
    id: 'invention',
    name: 'Invention Builder',
    description: 'Solve a problem with a cool new gadget or machine!',
    icon: 'Lightbulb',
    steps: [
      { id: 'problem', question: "What is a problem you want to solve? (e.g. messy rooms, slow homework)", field: 'problem' },
      { id: 'solution', question: "How does your invention solve this problem?", field: 'solution' },
      { id: 'name', question: "What is the name of your invention?", field: 'title' },
      { id: 'audience', question: "Who is this invention for? (e.g. kids, pets, parents)", field: 'audience' },
      { id: 'materials', question: "What cool things is it made of?", field: 'materials' },
    ]
  },
  {
    id: 'science',
    name: 'Science Fair Builder',
    description: 'Discover how the world works with a fun experiment!',
    icon: 'Beaker',
    steps: [
      { id: 'question', question: "What is the big question you want to answer? (e.g. Do plants like music?)", field: 'title' },
      { id: 'hypothesis', question: "What do you think will happen?", field: 'goal' },
      { id: 'materials', question: "What things do you need for your experiment?", field: 'materials' },
      { id: 'steps', question: "What are the steps to do your experiment?", field: 'steps' },
    ]
  }
];
