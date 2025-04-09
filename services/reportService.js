import { db as firestore } from '../config/firebase';

// Get all reports
export const getReports = async (status = 'all') => {
  try {
    const reportsCollection = collection(firestore, 'reports');
    let reportsQuery;
    
    if (status !== 'all') {
      reportsQuery = query(
        reportsCollection,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      reportsQuery = query(
        reportsCollection,
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(reportsQuery);
    
    const reports = [];
    for (const docSnapshot of querySnapshot.docs) {
      const report = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      };
      
      // Get user data
      if (report.userId) {
        const userDoc = await getDoc(doc(firestore, 'users', report.userId));
        if (userDoc.exists()) {
          report.user = {
            id: userDoc.id,
            ...userDoc.data()
          };
        }
      }
      
      reports.push(report);
    }
    
    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Get a single report by ID
export const getReportById = async (reportId) => {
  try {
    const reportDoc = await getDoc(doc(firestore, 'reports', reportId));
    
    if (!reportDoc.exists()) {
      throw new Error('Report not found');
    }
    
    const report = {
      id: reportDoc.id,
      ...reportDoc.data()
    };
    
    // Get user data
    if (report.userId) {
      const userDoc = await getDoc(doc(firestore, 'users', report.userId));
      if (userDoc.exists()) {
        report.user = {
          id: userDoc.id,
          ...userDoc.data()
        };
      }
    }
    
    return report;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw error;
  }
};

// Add a new report
export const addReport = async (reportData) => {
  try {
    const reportWithTimestamp = {
      ...reportData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(firestore, 'reports'), reportWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};



// Add a response to a report
export const addReportResponse = async (reportId, responseText, developerName) => {
  try {
    const reportRef = doc(firestore, 'reports', reportId);
    const reportDoc = await getDoc(reportRef);
    
    if (!reportDoc.exists()) {
      throw new Error('Report not found');
    }
    
    const reportData = reportDoc.data();
    const responses = reportData.responses || [];
    
    const newResponse = {
      id: Date.now().toString(),
      text: responseText,
      developerName,
      createdAt: serverTimestamp()
    };
    
    await updateDoc(reportRef, {
      responses: [...responses, newResponse],
      status: 'responded',
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding report response:', error);
    throw error;
  }
};

// Mark a report as resolved
export const resolveReport = async (reportId) => {
  try {
    await updateDoc(doc(firestore, 'reports', reportId), {
      status: 'resolved',
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error resolving report:', error);
    throw error;
  }
};
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Send a report to the developer
export const sendReport = async (reportData) => {
  try {
    // Add timestamp
    const report = {
      ...reportData,
      status: 'pending', // pending, in_progress, resolved, closed
      createdAt: Timestamp.now(),
      viewed: false,
      developerResponse: null,
      respondedAt: null
    };
    
    // Upload screenshot if provided
    if (reportData.screenshotUrl) {
      const screenshotUrl = await uploadReportScreenshot(
        reportData.screenshotUrl,
        reportData.userId
      );
      report.screenshotUrl = screenshotUrl;
    }
    
    // Create report in Firestore
    const reportRef = await addDoc(collection(db, 'reports'), report);
    
    // Return the created report
    return {
      id: reportRef.id,
      ...report,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error sending report:', error);
    throw error;
  }
};

// Upload screenshot to Firebase Storage
const uploadReportScreenshot = async (imageUri, userId) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const imageName = `report_${userId}_${Date.now()}`;
    const storageRef = ref(storage, `reports/${imageName}`);
    
    await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);
    
    return imageUrl;
  } catch (error) {
    console.error('Error uploading report screenshot:', error);
    throw error;
  }
};

// Get report history for a user
export const getReportHistory = async (userId) => {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const reportsSnapshot = await getDocs(reportsQuery);
    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      respondedAt: doc.data().respondedAt?.toDate?.() || null
    }));
    
    return reports;
  } catch (error) {
    console.error('Error getting report history:', error);
    throw error;
  }
};

// Get report details
export const getReportDetails = async (reportId) => {
  try {
    const reportDoc = await getDoc(doc(db, 'reports', reportId));
    if (!reportDoc.exists()) {
      throw new Error('Report not found');
    }
    
    const reportData = reportDoc.data();
    
    return {
      id: reportDoc.id,
      ...reportData,
      createdAt: reportData.createdAt?.toDate?.() || new Date(),
      respondedAt: reportData.respondedAt?.toDate?.() || null
    };
  } catch (error) {
    console.error('Error getting report details:', error);
    throw error;
  }
};

// Update report status (for developer use)
export const updateReportStatus = async (reportId, status) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

// Add developer response to a report
export const respondToReport = async (reportId, response) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      developerResponse: response,
      respondedAt: Timestamp.now(),
      status: 'resolved'
    });
    return true;
  } catch (error) {
    console.error('Error responding to report:', error);
    throw error;
  }
};

// Get pending reports (for developer dashboard)
export const getPendingReports = async () => {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    );
    
    const reportsSnapshot = await getDocs(reportsQuery);
    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    
    return reports;
  } catch (error) {
    console.error('Error getting pending reports:', error);
    throw error;
  }
};

// Mark a report as viewed
export const markReportAsViewed = async (reportId) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      viewed: true
    });
    return true;
  } catch (error) {
    console.error('Error marking report as viewed:', error);
    throw error;
  }
};

// Get report statistics (for developer dashboard)
export const getReportStatistics = async () => {
  try {
    const reportsRef = collection(db, 'reports');
    
    // Get all reports
    const reportsSnapshot = await getDocs(reportsRef);
    const reports = reportsSnapshot.docs.map(doc => doc.data());
    
    // Calculate statistics
    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const resolvedReports = reports.filter(r => r.status === 'resolved').length;
    const closedReports = reports.filter(r => r.status === 'closed').length;
    const inProgressReports = reports.filter(r => r.status === 'in_progress').length;
    
    // Count by type
    const reportsByType = {};
    reports.forEach(report => {
      if (!reportsByType[report.type]) {
        reportsByType[report.type] = 0;
      }
      reportsByType[report.type]++;
    });
    
    return {
      totalReports,
      pendingReports,
      resolvedReports,
      closedReports,
      inProgressReports,
      reportsByType
    };
  } catch (error) {
    console.error('Error getting report statistics:', error);
    throw error;
  }
};
