import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addQuestions() {
  await prisma.question.createMany({
    data:
    [
      {
        "groups": ["C", "CE"],
        "category": "Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia",
        "text": "Akou rýchlosťou môže jazdiť najviac vodič nákladného automobilu v obytnej zóne?",
        "options": [
            "30 km/h.",
            "Vjazd nákladných vozidiel do obytnej zóny je zakázaný.",
            "20 km/h."
        ],
        "correctAnswer": "C",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
    },
    {
        "groups": ["C", "CE"],
        "category": "Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia",
        "text": "Akou rýchlosťou môže jazdiť vodič nákladného automobilu v obytnej zóne?",
        "options": [
            "Najmenej 30 km/h.",
            "Najviac 20 km/h.",
            "Vjazd nákladných vozidiel do obytnej zóny je zakázaný."
        ],
        "correctAnswer": "B",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
    },
    {
        "groups": ["D", "DE"],
        "category": "Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia",
        "text": "Akou rýchlosťou môže jazdiť najviac vodič autobusu v obytnej zóne?",
        "options": [
            "20 km/h.",
            "Vjazd autobusom do obytnej zóny je zakázaný.",
            "30 km/h."
        ],
        "correctAnswer": "A",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
    },
    {
        "groups": ["D", "DE"],
        "category": "Uplatňovanie pravidiel prednosti v jazde a rýchlostné obmedzenia",
        "text": "Akou rýchlosťou môže jazdiť vodič autobusu v obytnej zóne?",
        "options": [
            "Najviac 20 km/h.",
            "Najmenej 30 km/h.",
            "Vjazd autobusom do obytnej zóny je zakázaný."
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
