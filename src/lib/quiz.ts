export type QuizTask =
  | {
      kind: "choice";
      title: string;
      prompt: string;
      options: string[];
      answer: number;
      reward: number;
    }
  | {
      kind: "wires";
      title: string;
      prompt: string;
      color: "red" | "blue" | "green" | "yellow";
      reward: number;
    }
  | {
      kind: "hold";
      title: string;
      prompt: string;
      duration: number;
      reward: number;
    };

const BANK: QuizTask[] = [
  {
    kind: "choice",
    title: "История",
    prompt: "В каком году началась Великая Отечественная война?",
    options: ["1939", "1941", "1945", "1914"],
    answer: 1,
    reward: 40,
  },
  {
    kind: "choice",
    title: "История",
    prompt: "Столица России?",
    options: ["Санкт-Петербург", "Казань", "Москва", "Екатеринбург"],
    answer: 2,
    reward: 25,
  },
  {
    kind: "choice",
    title: "Школа №124",
    prompt: "Что означает оценка «2» в дневнике?",
    options: ["Отлично", "Неудовлетворительно", "Зачёт", "Пропуск"],
    answer: 1,
    reward: 30,
  },
  {
    kind: "choice",
    title: "Математика",
    prompt: "Сколько будет 7 × 8?",
    options: ["54", "56", "64", "48"],
    answer: 1,
    reward: 25,
  },
  {
    kind: "choice",
    title: "География",
    prompt: "На каком материке находится Екатеринбург?",
    options: ["Африка", "Австралия", "Евразия", "Америка"],
    answer: 2,
    reward: 30,
  },
  {
    kind: "choice",
    title: "История",
    prompt: "Кто написал «Войну и мир»?",
    options: ["Достоевский", "Толстой", "Пушкин", "Чехов"],
    answer: 1,
    reward: 35,
  },
  {
    kind: "choice",
    title: "Логика",
    prompt: "У танка 2 гусеницы. У трёх танков сколько гусениц?",
    options: ["3", "4", "6", "8"],
    answer: 2,
    reward: 25,
  },
  {
    kind: "wires",
    title: "Проводка",
    prompt: "Соедини красный провод — нажми красную клемму.",
    color: "red",
    reward: 35,
  },
  {
    kind: "wires",
    title: "Проводка",
    prompt: "Нужен синий канал. Нажми синюю клемму.",
    color: "blue",
    reward: 35,
  },
  {
    kind: "wires",
    title: "Проводка",
    prompt: "Зелёный контур. Нажми зелёную клемму.",
    color: "green",
    reward: 35,
  },
  {
    kind: "hold",
    title: "Загрузка",
    prompt: "Удерживай кнопку, пока шкала не заполнится.",
    duration: 1.4,
    reward: 40,
  },
  {
    kind: "hold",
    title: "Сканер",
    prompt: "Удерживай сканирование бейджа.",
    duration: 1.1,
    reward: 30,
  },
];

export function randomTask(avoid?: QuizTask): QuizTask {
  let pick = BANK[Math.floor(Math.random() * BANK.length)]!;
  if (avoid && pick.prompt === avoid.prompt) {
    pick = BANK[Math.floor(Math.random() * BANK.length)]!;
  }
  return pick;
}
