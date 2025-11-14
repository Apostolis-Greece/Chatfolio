
"use strict";

document.addEventListener('DOMContentLoaded', function(event) {
  console.log(`${event.type} Event Fired`);

  /*
      Ζητάω με ένα ασύγχρονο αίτημα το αρχείο socials.zip. Μόλις το παραλάβω επιτυχώς,
      το αποσυμπιέζω και έπειτα βάζω τις φωτογραφίες στα αντίστοιχα html elements.

      Προσοχή: Μέσα στα <img> tags δεν έχω βάλει το "src" attribute γιατί πρέπει πρώτα η JavaScript
              να αποσυμπιέσει το .zip για να εξάγει τα png και να τα βάλει με δυναμικό τρόπο.
              Όμως, μέχρι να τοποθετηθούν δυναμικά τα png, τα <img> tags θα φαίνονται σπασμένα.
              Δηλ. θα έχουμε κακό User Experience

                  <button id="google-login-button" type="button" class="social-element">
                    <img class="social-image" alt="Google Logo" title="google.com">
                  </button>

                  <button id="linkedin-login-button" type="button" class="social-element">
                    <img class="social-image" alt="Linkedin Logo" title="linkedin.com">
                  </button>

                  <button id="twitter-login-button" type="button" class="social-element">
                    <img class="social-image" alt="Twitter Logo" title="twitter.com">
                  </button>

                  <button id="printerest-login-button" type="button" class="social-element">
                    <img class="social-image" alt="Printerest Logo" title="printerest.com">
                  </button>
              
      Λύση: Μέχρι η JavaScript να αποσυμπιέσει το .zip και να το τοποθετήσει τα png μέσα στα <img> tags,
            τα <img> tags θα είναι αόρατα ώστε να μην φανούν καθόλου σπασμένα.
  */
  const urlSocialsZip = document.getElementById('socials-container').dataset.zipUrl;

  fetch(urlSocialsZip)
    .then(response => response.arrayBuffer())
    .then(data => JSZip.loadAsync(data))
    .then(zip => {
      const buttons = {
        'google.png': 'google-login-button',
        'linkedin.png': 'linkedin-login-button',
        'twitter.png': 'twitter-login-button',
        'printerest.png': 'printerest-login-button'
      };

      Object.keys(buttons).forEach(fileName => {
        zip.file(fileName).async("base64").then(base64 => {
          const img = document.querySelector(`#${buttons[fileName]} img`);
          img.src = "data:image/png;base64," + base64; // τοποθετώ με δυναμικό τρόπο τα .png μέσα στα <img> tags
        });
      });

      // Εμφανίζω το <div id="socials-container"> μόλις τοποθετηθούν όλα τα .png μέσα στα <img> tags για καλό user experience
      console.log(`${urlSocialsZip} is successfully unzipped`);
      console.log('All <img> tags have successfully loaded .png files');
      cuteVisibleSocials();
    });


  function cuteVisibleSocials() {
      const socialsContainerTag = document.getElementById("socials-container");

      socialsContainerTag.style.visibility = "visible";
      setTimeout(function() {
          socialsContainerTag.style.opacity = 1;
      }, 10);
  }
}, { once: true });