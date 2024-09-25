import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addQuestions() {
  await prisma.question.createMany({
    data:
    [
      {
        "groups": ["C", "CE", "D", "DE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Vodič je povinný bezodkladne vypnúť motor, a ak je na vykurovanie vozidla použité nezávislé kúrenie, vypnúť aj toto kúrenie, ak",
        "options": [
          "zastavil na parkovisku.",
          "pri jazde v tuneli vznikne porucha vozidla, pre ktorú sa toto vozidlo stane nepojazdným.",
          "zastavil vozidlo pred železničným priecestím, kde sa dáva výstraha dvoma červenými striedavo prerušovanými svetlami priecestného zabezpečovacieho zariadenia."
        ],
        "correctAnswer": "B",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["A", "BE", "C", "CE", "D", "DE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Vodič po zastavení vozidla je povinný bezodkladne vypnúť motor, a ak je na vykurovanie vozidla použité nezávislé kúrenie, vypnúť aj toto kúrenie, ak",
        "options": [
          "pri jazde vozidla v tuneli vznikne porucha vozidla, pre ktorú sa toto vozidlo stane nepojazdným.",
          "vodič zastavil na parkovisku.",
          "zastavil vozidlo pred železničným priecestím, kde sa dáva výstraha dvoma červenými striedavo prerušovanými svetlami priecestného zabezpečovacieho zariadenia."
        ],
        "correctAnswer": "A",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["A", "BE", "C", "CE", "D", "DE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Ak pri jazde vozidla v tuneli vznikne porucha vozidla, pre ktorú sa toto vozidlo stane nepojazdným, alebo ak vznikne dopravná nehoda vrátane požiaru, je vodič po zastavení vozidla povinný bezodkladne",
        "options": [
          "zariadiť odtiahnutie vozidla z tunela.",
          "opustiť tunel a dopravnú nehodu oznámiť najbližšiemu policajtovi.",
          "vykonať vhodné opatrenia, aby nebola ohrozená bezpečnosť cestnej premávky v tuneli; ak to okolnosti vyžadujú, je oprávnený zastavovať iné vozidlá."
        ],
        "correctAnswer": "C",
        "difficulty": "hard",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["A", "BE", "C", "CE", "D", "DE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Ak pri jazde vozidla v tuneli vznikne porucha vozidla, pre ktorú sa toto vozidlo stane nepojazdným, alebo ak vznikne dopravná nehoda vrátane požiaru, je vodič po zastavení vozidla povinný bezodkladne",
        "options": [
          "zariadiť odtiahnutie vozidla z tunela.",
          "oznámiť telefonicky alebo iným vhodným spôsobom zastavenie vozidla v tuneli osobe vykonávajúcej dohľad nad prevádzkou tunela.",
          "opustiť tunel a dopravnú nehodu oznámiť najbližšiemu príslušníkovi obecnej polície."
        ],
        "correctAnswer": "B",
        "difficulty": "medium",
        "points": 3,
        "imageUrl": ""
      },
      {
        "groups": ["A", "BE", "C", "CE", "D", "DE"],
        "category": "Pravidlá cestnej premávky",
        "text": "Osoby prepravované vo vozidle sa môžu pohybovať po vozovke v tuneli len",
        "options": [
          "po pravej krajnici.",
          "v súvislosti so zaistením bezpečnosti cestnej premávky, ak majú na sebe reflexný bezpečnostný odev.",
          "v čase od 00.00 hod. do 04.00 hod."
        ],
        "correctAnswer": "B",
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
