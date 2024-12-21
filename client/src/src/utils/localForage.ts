import localforage from 'localforage';

localforage.config({
  name: 'DiceGame',
  storeName: 'store',
  description: 'Local storage for stake dice game',
});

export default localforage;
