"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("dotenv/config");
const prisma = new client_1.PrismaClient();
async function addQuestions() {
    await prisma.question.createMany({
        data: []
    });
    console.log('Questions added successfully');
    prisma.$disconnect();
}
addQuestions().catch((e) => {
    console.error(e);
    prisma.$disconnect();
});
