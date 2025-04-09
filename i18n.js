import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The translations
// We can move them to separate files and import them here
const resources = {
  en: {
    translation: {
      // Common
      welcome: "Welcome to the app!",
      signInToContinue: "Sign in to continue",
      login: "Login",
      signup: "Sign Up",
      logout: "Sign Out",
      email: "Email",
      password: "Password",
      search: "Search",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      back: "Back",
      success: "Success",
      error: "Error",
      loading: "Loading...",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      emailRequired: "Please enter your email/username",
      invalidEmail: "Please enter a valid email address",
      passwordRequired: "Please enter your password",
      enterEmail: "Enter email",
      enterUsername: "Enter username",
      enterPassword: "Enter password",
      testMode: "Test Mode (No Internet)",
      Customer: "Customer",
      Business: "Business",
      Developer: "Developer",
      
      // Home
      home: "Home",
      explore: "Explore",
      categories: "Categories",
      allCategories: "All",
      seeAll: "See All",
      map: "Map",
      messages: "Messages",
      reports: "Reports",
      customer: "Customer",
      business: "Business",
      searchBusinesses: "Search for businesses...",
      trackingOrder: "Tracking Order #",
      estimatedDelivery: "Estimated delivery:",
      status: "Status:",
      processing: "Processing",
      calculating: "Calculating...",
      retryLocation: "Retry",
      loadingMap: "Loading map...",
      failedToFetchBusinesses: "Failed to fetch businesses",
      
      // Business
      businessName: "Business Name",
      businessDescription: "Business Description",
      businessContact: "Contact Information",
      businessHours: "Business Hours",
      businessLocation: "Location",
      owner: "Owner",
      products: "Products",
      orders: "Orders",
      reviews: "Reviews",
      noReviews: "No reviews yet",
      
      // Customer
      myOrders: "My Orders",
      orderHistory: "Order History",
      orderDetails: "Order Details",
      orderStatus: "Status",
      orderDate: "Order Date",
      profile: "Profile",
      businessProfile: "Business Profile",
      developerProfile: "Developer Profile",
      administration: "Administration",
      
      // Developer
      adminDashboard: "Admin Dashboard",
      systemLogs: "System Logs",
      backupRestore: "Backup & Restore",
      systemSettings: "System Settings",
      developer: "Developer",
      actionsCompleted: "Actions Completed",
      userManagement: "User Management",
      businessManagement: "Business Management",
      approveBusinesses: "Approve Businesses",
      bannedUsers: "Banned Users",
      settings: "Settings",
      downloadBackup: "Download Backup",
      restoreBackup: "Restore Backup",
      backupInfo: "Download a backup of businesses data",
      lastBackup: "Last Backup",
      language: "Language",
      darkMode: "Dark Mode",
      notificationSettings: "Notification Settings",
      maintenance: "Maintenance Mode",
      appVersion: "App Version",
      serverStatus: "Server Status",
      activeUsers: "Active Users",
      
      // Messages
      loginSuccess: "Login successful",
      logoutSuccess: "Logged out successfully",
      networkError: "Network error. Please check your connection",
      accessDenied: "Access denied",
      permissionError: "You don't have permission to perform this action",
      editSuccess: "Changes saved successfully",
      backupSuccess: "Backup created successfully",
      restoreSuccess: "Restore completed successfully",
      settingsSaved: "Settings saved successfully"
    }
  },
  fr: {
    translation: {
      // Common
      welcome: "Bienvenue dans l'application !",
      signInToContinue: "Connectez-vous pour continuer",
      login: "Connexion",
      signup: "S'inscrire",
      logout: "Déconnexion",
      email: "Email",
      password: "Mot de passe",
      search: "Rechercher",
      save: "Enregistrer",
      cancel: "Annuler",
      confirm: "Confirmer",
      back: "Retour",
      success: "Succès",
      error: "Erreur",
      loading: "Chargement...",
      forgotPassword: "Mot de passe oublié ?",
      noAccount: "Vous n'avez pas de compte ?",
      emailRequired: "Veuillez entrer votre email/nom d'utilisateur",
      invalidEmail: "Veuillez entrer une adresse email valide",
      passwordRequired: "Veuillez entrer votre mot de passe",
      enterEmail: "Entrez votre email",
      enterUsername: "Entrez votre nom d'utilisateur",
      enterPassword: "Entrez votre mot de passe",
      testMode: "Mode test (sans Internet)",
      Customer: "Client",
      Business: "Entreprise",
      Developer: "Développeur",
      
      // Home
      home: "Accueil",
      explore: "Explorer",
      categories: "Catégories",
      allCategories: "Tout",
      seeAll: "Voir tout",
      map: "Carte",
      messages: "Messages",
      reports: "Rapports",
      customer: "Client",
      business: "Entreprise",
      searchBusinesses: "Rechercher des entreprises...",
      trackingOrder: "Suivi de commande #",
      estimatedDelivery: "Livraison estimée:",
      status: "Statut:",
      processing: "En traitement",
      calculating: "Calcul en cours...",
      retryLocation: "Réessayer",
      loadingMap: "Chargement de la carte...",
      failedToFetchBusinesses: "Échec du chargement des entreprises",
      
      // Business
      businessName: "Nom de l'entreprise",
      businessDescription: "Description de l'entreprise",
      businessContact: "Coordonnées",
      businessHours: "Heures d'ouverture",
      businessLocation: "Emplacement",
      owner: "Propriétaire",
      products: "Produits",
      orders: "Commandes",
      reviews: "Avis",
      noReviews: "Pas encore d'avis",
      
      // Customer
      myOrders: "Mes commandes",
      orderHistory: "Historique des commandes",
      orderDetails: "Détails de la commande",
      orderStatus: "Statut",
      orderDate: "Date de commande",
      profile: "Profil",
      businessProfile: "Profil d'Entreprise",
      developerProfile: "Profil de Développeur",
      administration: "Administration",
      
      // Developer
      adminDashboard: "Tableau de bord administrateur",
      systemLogs: "Journaux système",
      backupRestore: "Sauvegarde et restauration",
      systemSettings: "Paramètres système",
      developer: "Développeur",
      actionsCompleted: "Actions complétées",
      userManagement: "Gestion des utilisateurs",
      businessManagement: "Gestion des entreprises",
      approveBusinesses: "Approuver les entreprises",
      bannedUsers: "Utilisateurs bannis",
      settings: "Paramètres",
      downloadBackup: "Télécharger la sauvegarde",
      restoreBackup: "Restaurer la sauvegarde",
      backupInfo: "Télécharger une sauvegarde des données des entreprises",
      lastBackup: "Dernière sauvegarde",
      language: "Langue",
      darkMode: "Mode sombre",
      notificationSettings: "Paramètres de notification",
      maintenance: "Mode maintenance",
      appVersion: "Version de l'application",
      serverStatus: "Statut du serveur",
      activeUsers: "Utilisateurs actifs",
      
      // Messages
      loginSuccess: "Connexion réussie",
      logoutSuccess: "Déconnexion réussie",
      networkError: "Erreur réseau. Veuillez vérifier votre connexion",
      accessDenied: "Accès refusé",
      permissionError: "Vous n'avez pas la permission d'effectuer cette action",
      editSuccess: "Modifications enregistrées avec succès",
      backupSuccess: "Sauvegarde créée avec succès",
      restoreSuccess: "Restauration terminée avec succès",
      settingsSaved: "Paramètres enregistrés avec succès"
    }
  }
};

// Helper function to load and set saved language
const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('userLanguage');
    return savedLanguage || 'en';
  } catch (error) {
    console.error('Error loading language preference:', error);
    return 'en';
  }
};

// Helper function to save language preference
export const setLanguagePreference = async (language) => {
  try {
    await AsyncStorage.setItem('userLanguage', language);
    await i18n.changeLanguage(language);
    return true;
  } catch (error) {
    console.error('Error saving language preference:', error);
    return false;
  }
};

// Initialize with async loading of language
const initI18n = async () => {
  const savedLanguage = await loadLanguage();
  
  i18n
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
      resources,
      lng: savedLanguage, // Use saved language or default to English
      fallbackLng: "en",

      interpolation: {
        escapeValue: false // React already safes from xss
      }
    });
};

initI18n();

export default i18n;
