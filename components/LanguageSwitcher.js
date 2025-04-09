import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguagePreference } from '../i18n';
import { LinearGradient } from 'expo-linear-gradient';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = async (language) => {
    await setLanguagePreference(language);
  };

  const currentLanguage = i18n.language;

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            currentLanguage === 'en' && styles.activeLanguage,
          ]}
          onPress={() => changeLanguage('en')}
          activeOpacity={0.7}
        >
          {currentLanguage === 'en' ? (
            <LinearGradient
              colors={['#00214D', '#005792']}
              style={styles.activeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.activeLanguageText}>EN</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.languageText}>EN</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.languageButton,
            currentLanguage === 'fr' && styles.activeLanguage,
          ]}
          onPress={() => changeLanguage('fr')}
          activeOpacity={0.7}
        >
          {currentLanguage === 'fr' ? (
            <LinearGradient
              colors={['#00214D', '#005792']}
              style={styles.activeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.activeLanguageText}>FR</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.languageText}>FR</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 4,
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  activeLanguage: {
    // Styles are applied through the gradient
  },
  activeGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeLanguageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default LanguageSwitcher;
