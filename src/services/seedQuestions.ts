import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addQuestions() {
  await prisma.question.createMany({
    data:
    [
      {
        "groups": ["C", "CE", "D", "DE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Ak sa na vozovke nachádza súvislá snehová vrstva, ľad alebo námraza a v období od 15. novembra do 31. marca môže vodič motorového vozidla kategórie M2, M3, N2 a N3 použiť takéto vozidlo v cestnej premávke, len ak",
        "options": [
          "je držiteľom medzinárodnej poisťovacej karty.",
          "je toto vybavené aspoň na jednej z hnacích náprav pneumatikami na jazdu na snehu označené horským symbolom alebo pneumatikami s označením „M+S“, „M.S“ alebo „M&S“.",
          "je toto vybavené na všetkých nápravách zimnými pneumatikami."
        ],
        "correctAnswer": "B",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["D", "DE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Ak sa na vozovke nachádza súvislá snehová vrstva, ľad alebo námraza a v období od 15. novembra do 31. marca môže vodič motorového vozidla kategórie M2 a M3 použiť takéto vozidlo v cestnej premávke, len ak",
        "options": [
          "je toto vybavené aspoň na jednej z hnacích náprav pneumatikami na jazdu na snehu označené horským symbolom alebo pneumatikami s označením „M+S“, „M.S“ alebo „M&S“.",
          "je toto vybavené na všetkých nápravách zimnými pneumatikami.",
          "je držiteľom medzinárodnej poisťovacej karty."
        ],
        "correctAnswer": "A",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["C", "CE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Ak sa na vozovke nachádza súvislá snehová vrstva, ľad alebo námraza a v období od 15. novembra do 31. marca môže vodič motorového vozidla kategórie N2 a N3 použiť takéto vozidlo v cestnej premávke, len ak",
        "options": [
          "je toto vybavené na všetkých nápravách zimnými pneumatikami.",
          "je držiteľom medzinárodnej poisťovacej karty.",
          "je toto vybavené aspoň na jednej z hnacích náprav pneumatikami na jazdu na snehu označené horským symbolom alebo pneumatikami s označením „M+S“, „M.S“ alebo „M&S“."
        ],
        "correctAnswer": "C",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["BE", "C", "CE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Vodič vozidla je pred jazdou povinný",
        "options": [
          "odstrániť z vozidla ľad a sneh; na prepravovaný náklad vodič nie je povinný brať ohľad.",
          "namontovať na vozidlo zimné pneumatiky.",
          "odstrániť z vozidla a z nákladu kusy ľadu a snehu, ktoré by sa počas jazdy mohli uvoľniť."
        ],
        "correctAnswer": "C",
        "difficulty": "easy",
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
