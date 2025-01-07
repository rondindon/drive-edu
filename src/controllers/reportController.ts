import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { PrismaClient } from '@prisma/client'; 
// Adjust your interface path if needed
const prisma = new PrismaClient();

export async function createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id; // user ID from auth
      const { questionId, description, status } = req.body;
      // `status` is optional in the request body— if not provided, default to "Pending"
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      if (!questionId || !description) {
        return res.status(400).json({ message: 'questionId and description are required' });
      }
  
      // Create a new report in the DB
      const newReport = await prisma.reports.create({
        data: {
          userId,
          questionId,
          description,
          status: status || 'Pending', // if no status in body, use "Pending"
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
    console.log('getAllReports');
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
      const userId = req.user?.id; // User ID from auth
      const reportId = parseInt(req.params.id, 10); // Report ID from URL params
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }
  
      // Optional: Add authorization logic here (e.g., check if user is admin)
  
      // Check if the report exists
      const existingReport = await prisma.reports.findUnique({
        where: { id: reportId },
      });
  
      if (!existingReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
  
      // Update the report status to "Reviewed"
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
  
  /**
   * Update the status of a report to "Resolved"
   */
  export async function markReportResolved(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id; // User ID from auth
      const reportId = parseInt(req.params.id, 10); // Report ID from URL params
  
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }
  
      // Optional: Add authorization logic here (e.g., check if user is admin)
  
      // Check if the report exists
      const existingReport = await prisma.reports.findUnique({
        where: { id: reportId },
      });
  
      if (!existingReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
  
      // Update the report status to "Resolved"
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