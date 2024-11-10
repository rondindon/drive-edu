import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function addQuestions() {
  await prisma.question.createMany({
    data:
    [
      {
          "groups": ["C", "CE", "D", "DE"],
          "category": "Zásady bezpečnej jazdy",
          "text": "Ktoré z tvrdení je pravdivé?",
          "options": [
              "Čím je väčší rozdiel v rýchlosti prechádzajúceho a prechádzaného vozidla, tým bude potrebný čas na prechádzanie dlhší.",
              "Čím je menší rozdiel v rýchlosti prechádzajúceho a prechádzaného vozidla, tým bude potrebný čas na prechádzanie dlhší.",
              "Čím je menší rozdiel v rýchlosti prechádzajúceho a prechádzaného vozidla, tým bude potrebný čas na prechádzanie kratší."
          ],
          "correctAnswer": "B",
          "difficulty": "hard",
          "points": 3,
          "imageUrl": ""
      },
      {
          "groups": ["C", "CE", "D", "DE"],
          "category": "Zásady bezpečnej jazdy",
          "text": "Ktoré z tvrdení nie je pravdivé?",
          "options": [
              "Vodiča prechádzaného vozidla musíme na svoj úmysel prechádzať upozorniť svetelným výstražným znamením.",
              "Čím je menší rozdiel v rýchlosti prechádzajúceho a prechádzaného vozidla, tým bude potrebný čas na prechádzanie dlhší.",
              "Vodiča prechádzaného vozidla môžeme na svoj úmysel prechádzať upozorniť svetelným, prípadne mimo obce zvukovým výstražným znamením."
          ],
          "correctAnswer": "A",
          "difficulty": "hard",
          "points": 3,
          "imageUrl": ""
      },
      {
        "groups": ["C", "CE", "D", "DE"],
        "category": "Zásady bezpečnej jazdy",
        "text": "Ktoré z tvrdení nie je pravdivé?",
        "options": [
            "Pre bezpečné prechádzanie potrebujeme podstatne dlhšiu dráhu, ak rozdiel rýchlostí prechádzajúceho a prechádzaného vozidla nie je veľký.",
            "Čím je menší rozdiel v rýchlosti prechádzajúceho a prechádzaného vozidla, tým bude potrebný čas na prechádzanie dlhší.",
            "Čím je menší rozdiel v rýchlosti prechádzajúceho a prechádzaného vozidla, tým bude potrebný čas na prechádzanie kratší."
        ],
        "correctAnswer": "C",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
      },
      {
          "groups": ["C", "CE", "D", "DE"],
          "category": "Zásady bezpečnej jazdy",
          "text": "Ktoré z tvrdení nie je pravdivé?",
          "options": [
              "Na veľmi úzkych vozovkách včas zastavíme na miestach, kde je to pre vyhýbanie najvhodnejšie.",
              "Čím menší priestor je k dispozícii pre vyhýbanie, tým nižšia by mala byť rýchlosť jazdy míňajúcich sa vozidiel.",
              "Vodiči protiidúcich vozidiel sa vyhýbajú vľavo, včas a v dostatočnej miere."
          ],
          "correctAnswer": "C",
          "difficulty": "easy",
          "points": 3,
          "imageUrl": ""
      },
      {
          "groups": ["C", "CE", "D", "DE"],
          "category": "Zásady bezpečnej jazdy",
          "text": "Retardér má najväčší účinok pri",
          "options": [
              "nižších otáčkach motora, preto pred zapojením retardéra musíme preradiť na vyšší prevodový stupeň.",
              "optimálnych otáčkach motora, ktoré sa vyznačuje zelenou farbou na prístrojovom paneli vodiča.",
              "vyšších otáčkach motora, preto pred zapojením retardéra najprv preradíme na nižší prevodový stupeň."
          ],
          "correctAnswer": "C",
          "difficulty": "medium",
          "points": 3,
          "imageUrl": ""
      },
      {
          "groups": ["C", "CE", "D", "DE"],
          "category": "Zásady bezpečnej jazdy",
          "text": "Aký je správny postup zvyšovania brzdového výkonu retardéra?",
          "options": [
              "Retardér zapojíme na najvyšší stupeň brzdacieho účinku, ak dochádza ku kĺzaniu kolies, retardér vypneme.",
              "Retardér zapojíme na najvyšší stupeň brzdacieho účinku, ak dochádza ku kĺzaniu kolies, musíme ihneď znížiť brzdový účinok presunutím radiča na nižší stupeň.",
              "Brzdový výkon retardéra zásadne zvyšujeme postupne, po jednotlivých stupňoch radiča; vyšší stupeň brzdacieho účinku zapájame až po náležitom overení správania sa vozidla alebo jazdnej súpravy."
          ],
          "correctAnswer": "C",
          "difficulty": "hard",
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
