"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllUsers = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 100;
        const offset = Number(req.query.offset) || 0;
        const search = req.query.search || '';
        const roleFilter = req.query.role || 'All';
        let whereClause = {};
        if (search) {
            // Search by email or username (case-insensitive)
            whereClause.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (roleFilter !== 'All') {
            whereClause.role = roleFilter;
        }
        const users = await prisma.user.findMany({
            where: whereClause,
            orderBy: { id: 'asc' },
            take: limit,
            skip: offset,
        });
        return res.json(users);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.getAllUsers = getAllUsers;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { role, username } = req.body;
    try {
        const data = {};
        if (role)
            data.role = role;
        if (username !== undefined)
            data.username = username || null; // handle empty string as null
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data,
        });
        return res.json(updatedUser);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: Number(id) } });
        return res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
