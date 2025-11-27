import cron from 'node-cron';
import Resource from '../models/Resource.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import { sendEmail } from './emailService.js';
import { generateMonthlyReport } from './pdfGenerator.js';
import User from '../models/User.js';

// Daily task: Check for resources needing maintenance
const checkMaintenanceSchedule = cron.schedule('0 9 * * *', async () => {
  console.log('Running daily maintenance check...');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const resourcesDueMaintenance = await Resource.find({
      'metadata.nextMaintenance': {
        $gte: new Date(),
        $lte: tomorrow
      },
      status: { $ne: 'maintenance' }
    }).populate('createdBy');

    for (const resource of resourcesDueMaintenance) {
      // Create notification for admins
      const admins = await User.find({ role: 'admin' });

      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'resource_maintenance',
          title: 'Maintenance Due Tomorrow',
          message: `Resource "${resource.name}" requires maintenance tomorrow`,
          link: `/resources/${resource._id}`,
          priority: 'high',
          metadata: {
            resourceId: resource._id,
            resourceType: resource.type
          }
        });

        // Send email
        await sendEmail({
          to: admin.email,
          subject: `Maintenance Alert: ${resource.name}`,
          html: `
            <h2>Maintenance Schedule Alert</h2>
            <p>The following resource requires maintenance tomorrow:</p>
            <ul>
              <li><strong>Resource:</strong> ${resource.name}</li>
              <li><strong>Type:</strong> ${resource.type}</li>
              <li><strong>Scheduled:</strong> ${new Date(resource.metadata.nextMaintenance).toLocaleDateString()}</li>
            </ul>
            <p>Please ensure the maintenance is completed as scheduled.</p>
          `
        });
      }
    }

    console.log(`Maintenance alerts sent for ${resourcesDueMaintenance.length} resources`);
  } catch (error) {
    console.error('Maintenance check error:', error);
  }
});

// Daily task: Check for overdue complaints
const checkOverdueComplaints = cron.schedule('0 10 * * *', async () => {
  console.log('Checking for overdue complaints...');

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const overdueComplaints = await Complaint.find({
      status: { $in: ['pending', 'in-progress'] },
      createdAt: { $lte: sevenDaysAgo }
    }).populate('reportedBy assignedTo');

    for (const complaint of overdueComplaints) {
      // Notify admins and officers
      const adminsAndOfficers = await User.find({
        role: { $in: ['admin', 'officer'] }
      });

      for (const user of adminsAndOfficers) {
        await Notification.create({
          user: user._id,
          type: 'system_alert',
          title: 'Overdue Complaint',
          message: `Complaint "${complaint.title}" has been open for more than 7 days`,
          link: `/complaints/${complaint._id}`,
          priority: 'high',
          metadata: {
            complaintId: complaint._id,
            daysOpen: Math.floor((new Date() - complaint.createdAt) / (1000 * 60 * 60 * 24))
          }
        });
      }
    }

    console.log(`Overdue alerts sent for ${overdueComplaints.length} complaints`);
  } catch (error) {
    console.error('Overdue complaints check error:', error);
  }
});

// Weekly task: Check critical resource utilization
const checkCriticalResources = cron.schedule('0 8 * * 1', async () => {
  console.log('Checking for critical resources...');

  try {
    const resources = await Resource.find({});

    const criticalResources = resources.filter(resource => {
      const utilizationRate = (resource.currentUsage.value / resource.capacity.value) * 100;
      return utilizationRate > 90;
    });

    if (criticalResources.length > 0) {
      const admins = await User.find({ role: 'admin' });

      for (const admin of admins) {
        const resourceList = criticalResources.map(r =>
          `- ${r.name} (${r.type}): ${((r.currentUsage.value / r.capacity.value) * 100).toFixed(1)}% utilized`
        ).join('\n');

        await Notification.create({
          user: admin._id,
          type: 'resource_critical',
          title: 'Critical Resource Alert',
          message: `${criticalResources.length} resources are over 90% capacity`,
          priority: 'urgent',
          metadata: {
            criticalCount: criticalResources.length
          }
        });

        await sendEmail({
          to: admin.email,
          subject: 'Weekly Critical Resources Report',
          html: `
            <h2>Critical Resource Alert</h2>
            <p>The following resources are operating at over 90% capacity:</p>
            <pre>${resourceList}</pre>
            <p>Please take immediate action to prevent service disruptions.</p>
          `
        });
      }
    }

    console.log(`Critical resource alerts sent for ${criticalResources.length} resources`);
  } catch (error) {
    console.error('Critical resources check error:', error);
  }
});

// Monthly task: Generate and send monthly reports
const generateMonthlyReports = cron.schedule('0 9 1 * *', async () => {
  console.log('Generating monthly reports...');

  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get monthly statistics
    const totalComplaints = await Complaint.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });

    const resolvedComplaints = await Complaint.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth },
      status: 'resolved'
    });

    // Generate report data (simplified - full implementation would be more detailed)
    const reportData = {
      period: `${lastMonth.toLocaleDateString()} - ${thisMonth.toLocaleDateString()}`,
      complaints: {
        total: totalComplaints,
        resolved: resolvedComplaints,
        pending: totalComplaints - resolvedComplaints,
        resolutionRate: totalComplaints > 0
          ? ((resolvedComplaints / totalComplaints) * 100).toFixed(2)
          : 0
      },
      complaintsByCategory: {},
      resources: {
        water: { total: 0, unit: 'liters' },
        electricity: { total: 0, unit: 'kWh' },
        waste: { total: 0, unit: 'kg' }
      },
      topIssues: []
    };

    const report = await generateMonthlyReport(reportData);

    // Send to admins
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `Monthly Report - ${lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        html: `
          <h2>Monthly Report</h2>
          <p>Your monthly village management report is attached.</p>
          <p>Report generated for: ${reportData.period}</p>
        `,
        attachments: [
          {
            filename: report.fileName,
            path: report.filePath
          }
        ]
      });

      await Notification.create({
        user: admin._id,
        type: 'report_generated',
        title: 'Monthly Report Generated',
        message: 'Your monthly statistics report is ready',
        link: report.relativePath,
        priority: 'medium'
      });
    }

    console.log('Monthly reports generated and sent');
  } catch (error) {
    console.error('Monthly report generation error:', error);
  }
});

// Clean up old notifications (daily)
const cleanupOldNotifications = cron.schedule('0 2 * * *', async () => {
  console.log('Cleaning up old notifications...');

  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const result = await Notification.deleteMany({
      isRead: true,
      readAt: { $lt: sixtyDaysAgo }
    });

    console.log(`Deleted ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('Notification cleanup error:', error);
  }
});

// Start all scheduled tasks
export const startScheduler = () => {
  console.log('Starting scheduled tasks...');

  checkMaintenanceSchedule.start();
  checkOverdueComplaints.start();
  checkCriticalResources.start();
  generateMonthlyReports.start();
  cleanupOldNotifications.start();

  console.log('✅ All scheduled tasks started');
};

// Stop all scheduled tasks
export const stopScheduler = () => {
  checkMaintenanceSchedule.stop();
  checkOverdueComplaints.stop();
  checkCriticalResources.stop();
  generateMonthlyReports.stop();
  cleanupOldNotifications.stop();

  console.log('⏹️ All scheduled tasks stopped');
};

export default {
  startScheduler,
  stopScheduler
};
