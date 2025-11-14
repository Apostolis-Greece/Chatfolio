
"use strict";

document.addEventListener('DOMContentLoaded', function(event) {
  console.log(`${event.type} Event Fired`);

  // ----------------------------------- Initialization: Clear Form
  const emailValueTag = document.getElementById('email-textfield');
  const emailErrorTag = document.getElementById('email-error-area');
  const passwordValueTag = document.getElementById('password-textfield');
  const passwordErrorTag = document.getElementById('password-error-area');
  const confirmValueTag = document.getElementById('confirm-textfield');
  const confirmErrorTag = document.getElementById('confirm-error-area');

  if (emailValueTag !== null) emailValueTag.value = "";
  if (passwordValueTag !== null) passwordValueTag.value = "";
  if (confirmValueTag !== null) confirmValueTag.value = "";
  if (emailErrorTag !== null) emailErrorTag.value = "";
  if (passwordErrorTag !== null) passwordErrorTag.value = "";
  if (confirmErrorTag !== null) confirmErrorTag.value = "";


  // ----------------------------------- Initialization: Set Event Listeners
  /* Στήνω έναν event listener για να κλείνει το popup-errors όταν πατηθεί κλικ εξωτερικά αυτού
    Ελέγχω αν το στοιχείο που πυροδότησε το click event είναι εντός του popup-errors ή όχι */
  document.addEventListener('click', (e) => {
    const popupErrorsContainerTag = document.getElementById('popup-errors-container');

    if (!popupErrorsContainerTag.contains(e.target)) {
      popupErrorsContainerTag.style.display = 'none';
    }
  });


  if (emailValueTag !== null) emailValueTag.addEventListener('input', checkEmail);
}, { once: true });




//----------------------------------- Define Functions
// -------------------- Close popup errors by clicking the "Close" button
function closePopupErrors() {
    document.getElementById('popup-errors-container').style.display = 'none';
}


// ----------------------------------- Email Validation
function checkEmail(){
  const emailValueTag = document.getElementById('email-textfield');
  const emailErrorTag = document.getElementById('email-error-area');

  if(emailValueTag.value.trim() === '') {
      emailErrorTag.textContent = '';
      return false;
  }
  if(!validateEmail(emailValueTag.value)) {
      emailErrorTag.textContent = 'Invalid email address';
      return false;
  }
  emailErrorTag.textContent = '';
  return true;
}


function validateEmail(email){
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // conservative RFC-like regex but not exhaustive
    return re.test(email);
}


// ----------------------------------- Password Hide and Show
function hideShowPasswordLogin() {
  const passwordValueTag = document.getElementById('password-textfield');
  const lambTag = document.getElementById('lamb');

  if (passwordValueTag.type === 'password') {
    passwordValueTag.type = 'text';
    lambTag.style.opacity = 0.5;
  } else {
    passwordValueTag.type = 'password';
    lambTag.style.opacity = 1;
  }
}


function hideShowPasswordRegister() {
  const passwordValueTag = document.getElementById('password-textfield');
  const confirmValueTag = document.getElementById('confirm-textfield');
  const lambTag = document.getElementById('lamb');

  if (passwordValueTag.type === 'password') {
    passwordValueTag.type = 'text';
    if (confirmValueTag !== null) confirmValueTag.type = 'text';
    lambTag.style.opacity = 0.5;
  } else {
    passwordValueTag.type = 'password';
    if (confirmValueTag !== null) confirmValueTag.type = 'password';
    lambTag.style.opacity = 1;
  }
}


// ----------------------------------- Open/Close Credentials Popup
function openPopupCredentials() {
    const popup = document.getElementById('popup-credentials-container');

    /* Μόλις τρέξει το display:block θα εμφανίσει κατευθείαν το popup. Άρα, όταν θα τρέξει το
      opacity:1 δε θα αντιληφθεί κάποια αλλαγή και δε θα ενεργοποιηθεί το transition opacity 1s.
      Λύση: Βάζω λίγη καθυστέρηση μετά το display:block */
    popup.style.display = 'block';
    setTimeout(function() {
        popup.style.opacity = 1;
    }, 10);
}


function closePopupCredentials() {
    const popup = document.getElementById('popup-credentials-container');

    /* Μόλις τρέξει το opacity:0 θα τρέξει κατευθείαν και το display:block. Άρα θα εξαφανιστεί
      κατευθείαν το popup και δε θα αντιληφθεί κάποια αλλαγή και δε θα ενεργοποιηθεί το transition opacity 1s.
      Λύση: Βάζω λίγη καθυστέρηση μετά το opacity:1 */
    popup.style.opacity = 0;
    setTimeout(function() {
        popup.style.display = 'none';
    }, 1010);
}