import { Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient();

export async function createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { questionId, description, status } = req.body;
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      if (!questionId || !description) {
        return res.status(400).json({ message: 'questionId and description are required' });
      }
  
      const newReport = await prisma.reports.create({
        data: {
          userId,
          questionId,
          description,
          status: status || 'Pending',
        },
      });
  
      return res.status(201).json({
        message: 'Report created successfully',
        report: newReport,
      });
    } catch (error) {
      console.error('[createReport] Error:', error);
      return res.status(500).json({ message: 'Error creating report' });
    }
  }

export async function getAllReports(req: AuthenticatedRequest, res: Response) {
    try {
      const reports = await prisma.reports.findMany({
        include: {
          question: true,
          user: true,
        },
      });
  
      return res.status(200).json({ reports });
    } catch (error) {
      console.error('[getAllReports] Error:', error);
      return res.status(500).json({ message: 'Error fetching reports' });
    }
  }

  export async function markReportReviewed(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const reportId = parseInt(req.params.id, 10); 
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }
  
      const existingReport = await prisma.reports.findUnique({
        where: { id: reportId },
      });
  
      if (!existingReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
  
      const updatedReport = await prisma.reports.update({
        where: { id: reportId },
        data: { status: 'Reviewed' },
      });
  
      return res.status(200).json({
        message: 'Report status updated to Reviewed',
        report: updatedReport,
      });
    } catch (error) {
      console.error('[markReportReviewed] Error:', error);
      return res.status(500).json({ message: 'Error updating report status' });
    }
  }
  
  export async function markReportResolved(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const reportId = parseInt(req.params.id, 10);
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }
  
      const existingReport = await prisma.reports.findUnique({
        where: { id: reportId },
      });
  
      if (!existingReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
  
      const updatedReport = await prisma.reports.update({
        where: { id: reportId },
        data: { status: 'Resolved' },
      });
  
      return res.status(200).json({
        message: 'Report status updated to Resolved',
        report: updatedReport,
      });
    } catch (error) {
      console.error('[markReportResolved] Error:', error);
      return res.status(500).json({ message: 'Error updating report status' });
    }
  }

  export async function deleteReport(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const reportId = parseInt(req.params.id, 10);
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }
  
      const existingReport = await prisma.reports.findUnique({
        where: { id: reportId },
      });
  
      if (!existingReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
  
      await prisma.reports.delete({
        where: { id: reportId },
      });
  
      return res.status(200).json({
        message: 'Report deleted successfully',
      });
    } catch (error) {
      console.error('[deleteReport] Error:', error);
      return res.status(500).json({ message: 'Error deleting report' });
    }
  }