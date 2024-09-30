import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addQuestions() {
  await prisma.question.createMany({
    data:
    [
      {
        "groups": ["A"],
        "category": "Pravidlá cestnej premávky",
        "text": "Osoba, ktorá tlačí motocykel",
        "options": [
          "smie použiť chodník, len ak neohrozí ani neobmedzí chodcov; inak musí použiť pravú krajnicu alebo pravý okraj vozovky.",
          "nesmie použiť chodník a je povinná použiť ľavú krajnicu.",
          "smie použiť chodník, len ak v blízkosti nie sú chodci."
        ],
        "correctAnswer": "A",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
      }
      
    ]
    
    
  });

  console.log('Questions added successfully');
  prisma.$disconnect();
}

addQuestions().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
