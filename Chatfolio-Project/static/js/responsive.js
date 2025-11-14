
"use strict";

document.addEventListener('DOMContentLoaded', (event) => {
  console.log(`${event.type} Event Fired`);

  // ----------------------------------- Responsive
  /*
      Στα κινητά το body { min-height: 100vh; } δεν είναι πάντα ακριβές γιατί μερικές φορές
      το 100vh δεν περιελαμβάνει το χώρο που καταλαμβάνει το address bar στον browser.

      Λύση
        α) Με κώδικα JavaScript θέτω τη CSS variable --vh ίση με το πραγματικό ύψος της οθόνης      
        β) Στο CSS body δε γράφω "min-height: 100vh;"" αλλά "min-height: calc(var(--vh, 1vh) * 100);"
      
      Αν δεν δουλέψει το innerWidth/innerHeight να χρησιμοποιήσω το clientWidth/clientHeight
      Το ένα μετράει paddings και όχι margins,borders,scrolls και το άλλο όχι
  */
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}, { once: true });