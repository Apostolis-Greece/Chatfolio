
"use strict";

document.addEventListener('DOMContentLoaded', (event) => {
    console.log(`${event.type} Event Fired`);

    // -------------------------------- Alternative Login
    /* Replace with real OAuth flows on server-side.
    In a real app, redirect to your backend which starts the OAuth flow with Google.

    Λύση 1: Στήνω για κάθε button και από έναν event listener
    Λύση 2: Event Delegation
            Αντί να στήσω 1 event listener για κάθε χώρα και να επιβαρύνω αρκετά την απόδοση της σελίδας,
            θα στήσω έναν κοινό event listener στο CONTAINER ΚΑΙ ΟΧΙ ΣΤΑ ΕΠΙΜΕΡΟΥΣ ΣΤΟΙΧΕΙΑ και θα ψάξω να βρω από ποιο ΠΑΙΔΙ πυροδοτήθηκε το event μέσω event.target
    */
    document.getElementById('socials-container').addEventListener("click", (event) => {
        const element = event.target.closest('.social-element'); console.log(element);
        
        if (element === null) {
            console.log('Event Delegation: a click event was fired by accident and is successfully ignored');
            return;
        }
        console.log(`Login via ${element.id}`);
    });


    // -------------------------------- Check if a user is already logged in
    /*
        Αυτός ο Event Listener ακούει όταν κάνω κλικ πάνω στο email textfield και κάνει τα εξής:
            1. Ψάχνει στο localStorage όλα τα objects με key = "loginCredentials_"
            2. Φτιάχνει ένα html element: <datalist id="datalist"></datalist>
            3. Φτιάχνει τα html elements: <option value="..."></option>
                τα οποία περιέχουν όλα τα email που είναι αποθηκευμένα στο localStorage
            4. Βάζει όλα τα <option> μέσα στο <datalist>:
                    <datalist id="datalist">
                        <option value="email_1"></option>
                        <option value="email_2"></option>
                        ...
                        <option value="email_N"></option>
                    </datalist>
            5. Συνδέει το email textfield με το <datalist> ώστε
                όταν επιλέγω ένα email από τη λίστα να γράφεται στο email textfield
            6. Βάζει το <datalist> μέσα στο DOM
    */
    document.getElementById('email-textfield').addEventListener('focus', function() {
        const allObjects = Object.keys(localStorage);
        const loginCredentialsKeys = allObjects.filter(key => key.includes('loginCredentials_'));
        const loginCredentialsObjects = loginCredentialsKeys.map(key => JSON.parse(localStorage.getItem(key)));
        //console.log(loginCredentialsObjects);

        if (loginCredentialsObjects.length > 0) {
            let credentialsList = document.createElement('datalist');
            credentialsList.id = 'datalist';

            loginCredentialsObjects.forEach(credentials => {
                const option = document.createElement('option');
                option.value = credentials.email;
                credentialsList.appendChild(option);
                //console.log(option);
            });
            console.log(credentialsList);

            if (!document.getElementById('datalist')) {
                document.getElementById('email-textfield').setAttribute('list', credentialsList.id);
                document.body.appendChild(credentialsList);
            }
        }
    });


    /*
        Αυτός ο Event Listener ακούει τις αλλαγές που γίνονται στο email textfield
        (πχ όταν επιλέγω από το <datalist> ένα email που είναι αποθηκευμένο μέσα στο localStorage)
        και γράφει πάνω στο password textfield το password για τον αντίστοιχο χρήστη
    */
    document.getElementById('email-textfield').addEventListener('input', function() {
        const email = document.getElementById('email-textfield').value;
        const credentials = JSON.parse(localStorage.getItem(`loginCredentials_${email}`));

        if (credentials) {
            document.getElementById('password-textfield').value = credentials.password;
        } else {
            document.getElementById('password-textfield').value = '';
        }
    });


    /*
        Αν η φόρμα δεν είναι έγκυρη, δε στείλω αίτημα στο back-end για να:
            α) μην επιβαρύνω χωρίς λόγο τον server
            β) μην επιβαρύνω το user experience με την καθυστέρηση όσπου να πάει το request και να έρθει το response
    
        Ενώ αν η φόρμα είναι έγκυρη, τότε στέλνω Ασύγχρονο JSON POST Request για να ελεγχθεί περαιτέρω
        από το forms.py, βάζοντας Lazy Load για καλό user experience.
    */
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const popupErrorsContainerTag = document.getElementById('popup-errors-container');
        const lazyLoadTag = document.getElementById('lazy-load');
        const errorsText = document.getElementById('errors-text');

        if (validateLoginForm() === false) {
            errorsText.innerHTML = 'Invalid Form';
            popupErrorsContainerTag.style.display = 'block';
        }
        else {
            lazyLoadTag.style.display = 'block';
            loginAsyncPostRequest();
            console.log("fetch is an async function, i.e. it returns a Promise instead of blocking the main thread. So, this message is printed before JSON POST Reply.");
        }
    });

    function validateLoginForm() {
    const emailValueTag = document.getElementById('email-textfield');
    const passwordValueTag = document.getElementById('password-textfield');

        if (emailValueTag.value === '') return false;
        if (passwordValueTag.value === '') return false;
        if (checkEmail() === false) return false;
        return true;
    }


    /* Προσοχή
        α) Μετά από HTTP POST Request (πχ <form method="POST">) πρέπει να κάνω redirect σερβίροντας GET
            ώστε αν ο χρήστης κάνει reload να μη γίνει διπλό POST και δημιουργηθεί πρόβλημα.
            δηλ. redirect(...) και όχι render(...)

        β) Μετά από JSON POST Request (πχ <form id> getElementById.addEventListener("submit"), {...}
            δεν κινδυνεύω από διπλό POST και η JavaScript από το front-end απλά θα κάνει href ή καλύτερα replace()
    */
    function loginAsyncPostRequest(){
        const emailValueTag = document.getElementById('email-textfield');
        const passwordValueTag = document.getElementById('password-textfield');
        const lazyLoadTag = document.getElementById('lazy-load');
        const popupErrorsContainerTag = document.getElementById('popup-errors-container');
        const errorsText = document.getElementById('errors-text');

        const userCredentials = {
            email: emailValueTag.value,
            password: passwordValueTag.value
        };
        const url = '/login/';
        let fetchData = {
            method: 'POST',
            body: JSON.stringify(userCredentials),
            headers: new Headers({
                'Content-Type': 'application/json; charset=UTF-8',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value // CSRF token αφού κάνω POST σε δικό μου URL
            })
        }
        
        fetch(url, fetchData)
        .then(response => response.json())
        .then(responseData => {
            if (responseData.status === 'success') {
                lazyLoadTag.style.display = 'none'; // Κρύβω το Spinner μόλις έρθει το JSON POST Response

                /* Αν υπάρχει τέτοιος χρήστης, τον ρωτάω αν θέλει να αποθηκευτούν τα στοιχεία του
                στον browser, αν δεν είναι ήδη αποθηκευμένα και έπειτα τον κατευθύνω στο chat.html */
                const allObjects = Object.keys(localStorage);
                const loginCredentialsKeys = allObjects.filter(key => key.includes('loginCredentials_'));
                const exists = loginCredentialsKeys.some(key => {
                    const storedCredentials = JSON.parse(localStorage.getItem(key));
                    return storedCredentials.email === userCredentials.email && storedCredentials.password === userCredentials.password;
                });
                
                if (!exists) {
                    openPopupCredentials();
                    /*
                    Ελέγχω αν ο χρήστης θέλει να αποθηκευτούν τα στοιχεία του στον browser και πράττω αναλόγως.
                        Λύση 1: Απλή λύση με 2 Event Listeners
                                    --> +1 που ακούει στο κουμπί yes-button
                                    --> +1 που ακούει στο κουμπί no-button

                                document.getElementById('yes-button').addEventListener('click', function() {
                                    localStorage.setItem(...);
                                    popup.style.display = 'none'; popup.style.opacity = 0;
                                });

                                document.getElementById('no-button').addEventListener('click', function() {
                                    popup.style.display = 'none'; popup.style.opacity = 0;
                                });

                        Λύση 2: Καλύτερη λύση με μόνο 1 Event Listener που ακούει σε όλο το container
                                και εντοπίζει ποιό web component ή html tag τον ενεργοποίησε.
                        
                        Λύση 3: Καλύτερη και πιο απλή λύση με μόνο 1 checkbox που παίρνει τιμές true/false
                    
                    */
                    
                    /* Λύση 2: Event Delegation */
                    document.getElementById('popup-buttons-container').addEventListener('click', function(event) {
                        /* Το click event μπορεί να πυροδοτήθηκε από:
                                α) <button id="yes-button">Yes</button>
                                β) <button id="no-button">No</button>
                                γ) υπόλοιπο κενό χώρο του popup container (πχ text, padding κλπ)

                            Άρα, πρέπει να μεριμνήσω ώστε αν το click event πυροδοτήθηκε κατά λάθος
                            να αγνοηθεί για να αποφύγουμε ένα κακό user experience ή bug */
                        const element = event.target; console.log(element);
                        if ((element.id !== 'yes-button') && (element.id !== 'no-button')) {
                            console.log('Event Delegation: a click event was fired by accident and is successfully ignored');
                            return;
                        }

                        if (element.id === 'yes-button') {
                            localStorage.setItem(`loginCredentials_${userCredentials.email}`, JSON.stringify(userCredentials));
                        }

                        closePopupCredentials();
                        lazyLoadTag.style.display = 'none';
                        window.location.replace('/chat/');
                    });
                }
                else {
                    lazyLoadTag.style.display = 'none';
                    window.location.replace('/chat/');
                }
            }
            /* Αν το JSON POST Response είναι {success: 'false'} τότε κρύβω το Spinner
            και εμφανίζω το popup με τα σφάλματα */
            else {
                lazyLoadTag.style.display = 'none';
                errorsText.innerHTML = responseData.message;
                popupErrorsContainerTag.style.display = 'block';
            }
        })
        .catch(error => {
            lazyLoadTag.style.display = 'none'; // Κρύβω το Spinner μόλις έρθει το JSON POST Response
            console.error('Error:', error);
        });
    }
}, { once: true });