import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addQuestions() {
  await prisma.question.createMany({
    data:
    [
      {
        "groups": ["A"],
        "category": "Pravidlá cestnej premávky",
        "text": "Smie vodič motocykla stáť v obytnej zóne?",
        "options": [
          "Nie, ak dopravnou značkou nie je určené inak.",
          "Nie, ani vtedy ak to umožňuje dopravná značka.",
          "Áno."
        ],
        "correctAnswer": "A",
        "difficulty": "easy",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["A"],
        "category": "Pravidlá cestnej premávky",
        "text": "Smie vodič motocykla zastaviť v obytnej zóne?",
        "options": [
          "Áno.",
          "Nie.",
          "Iba vtedy, ak to umožňuje dopravná značka."
        ],
        "correctAnswer": "A",
        "difficulty": "easy",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["A"],
        "category": "Pravidlá cestnej premávky",
        "text": "Smie vodič motocykla stáť v školskej zóne?",
        "options": [
          "Nie.",
          "Len, ak je to dovolené dopravnou značkou.",
          "Áno, ak tým nie je obmedzený pohyb chodcov."
        ],
        "correctAnswer": "C",
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
