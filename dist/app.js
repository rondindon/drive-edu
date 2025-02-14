"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const corsOptions = {
    origin: ['https://www.driveready.site', 'https://drive-edu.vercel.app', 'http://localhost:3000'],
    optionsSuccessStatus: 200, // For legacy browser support
};
app.use((0, cors_1.default)(corsOptions));
app.use('/api', routes_1.default);
const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
