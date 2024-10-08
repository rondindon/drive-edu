import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addQuestions() {
  await prisma.question.createMany({
    data:
    [
      {
        "groups": ["D", "DE"],
        "category": "Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia",
        "text": "Akou rýchlosťou môže jazdiť najviac vodič autobusu v školskej zóne?",
        "options": [
            "20 km/h.",
            "30 km/h.",
            "Vjazd autobusom do školskej zóny je zakázaný."
        ],
        "correctAnswer": "A",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
    },
    {
        "groups": ["D", "DE"],
        "category": "Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia",
        "text": "Akou rýchlosťou môže jazdiť vodič autobusu v školskej zóne?",
        "options": [
            "Najmenej 30 km/h.",
            "Vjazd autobusom do školskej zóny je zakázaný.",
            "Najviac 20 km/h."
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
