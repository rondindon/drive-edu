import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addQuestions() {
  await prisma.question.createMany({
    data: [
      // {
      //   groups: ["A", "B", "BE", "C", "CE", "D", "DE", "T"],
      //   category: 'Pravidlá cestnej premávky',
      //   text: 'Pred odbočovaním vpravo je vodič povinný',
      //   options: [
      //     'pred zaradením sa k pravému okraju vozovky dávať vždy zvukové výstražné znamenie alebo svetelné výstražné znamenie.',
      //     'zaradiť sa vždy do stredu vozovky.',
      //     'zaradiť sa čo najbližšie k pravému okraju vozovky; ak pritom musí s ohľadom na rozmery vozidla alebo nákladu vybočiť zo smeru svojej jazdy vľavo, vždy dáva len znamenie o zmene smeru jazdy vpravo.'
      //   ],
      //   correctAnswer: 'C',
      //   difficulty: 'medium',
      //   points: 3,
      // }
    ]
  });

  console.log('Questions added successfully');
  prisma.$disconnect();
}

addQuestions().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
