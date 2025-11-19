// Translation helper for remaining language files
// This script would use translation APIs to batch translate
// For now, documenting the approach

const languagesToTranslate = {
  'el': 'Greek',
  'uk': 'Ukrainian', 
  'hi': 'Hindi',
  'bn': 'Bengali',
  'id': 'Indonesian',
  'th': 'Thai',
  'he': 'Hebrew',
  'fa': 'Persian',
  'ur': 'Urdu',
  'af': 'Afrikaans',
  'ak': 'Akan',
  'am': 'Amharic',
  'ha': 'Hausa',
  'ig': 'Igbo',
  'sw': 'Swahili',
  'yo': 'Yoruba'
};

console.log('Languages requiring translation:', Object.keys(languagesToTranslate).length);
console.log('Total translation strings per file: ~90');
console.log('Total translations needed:', Object.keys(languagesToTranslate).length * 90);
