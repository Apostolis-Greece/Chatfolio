
from django.contrib.auth import get_user_model
from django import forms
import re

User = get_user_model()


COUNTRY_CHOICES = [
    ("", ""), ("Argentina", "Argentina"), ("Armenia", "Armenia"), ("Australia", "Australia"),
    ("Austria", "Austria"), ("Belarus", "Belarus"), ("Belgium", "Belgium"),
    ("Bosnia and Herzegovina", "Bosnia and Herzegovina"), ("Brazil", "Brazil"),
    ("Bulgaria", "Bulgaria"), ("Canada", "Canada"), ("China", "China"), ("Croatia", "Croatia"),
    ("Cyprus", "Cyprus"), ("Czech Republic", "Czech Republic"), ("Denmark", "Denmark"),
    ("Egypt", "Egypt"), ("Estonia", "Estonia"), ("Finland", "Finland"), ("France", "France"),
    ("Georgia", "Georgia"), ("Germany", "Germany"), ("Greece", "Greece"), ("Hungary", "Hungary"),
    ("Iceland", "Iceland"), ("India", "India"), ("Ireland", "Ireland"), ("Italy", "Italy"),
    ("Japan", "Japan"), ("Latvia", "Latvia"), ("Lithuania", "Lithuania"),
    ("Luxembourg", "Luxembourg"), ("Malta", "Malta"), ("Moldova", "Moldova"), ("Montenegro", "Montenegro"), ("Netherlands", "Netherlands"), ("New Zealand", "New Zealand"), ("Norway", "Norway"), ("Poland", "Poland"), ("Portugal", "Portugal"), ("Romania", "Romania"), ("Russia", "Russia"), ("Serbia", "Serbia"), ("Slovakia", "Slovakia"), ("Slovenia", "Slovenia"), ("Spain", "Spain"), ("Sweden", "Sweden"), ("Switzerland", "Switzerland"), ("Turkey", "Turkey"), ("Ukraine", "Ukraine"), ("England", "England"), ("United States", "United States"),
]

'''
    Η Django κάνει αυτόματα κάποιους ελέγχους (πχ αν όλα τα πεδία είναι συμπληρωμένα)
    Εγώ κάνω τους δικούς μου ελέγχους:
        α) μεμονωμένα για κάποιο πεδίο μέσω της συνάρτησης clean_<fieldname>()
        β) συνδυαστικά για πολλά πεδία μέσω της συνάρτησης clean()
'''
class RegisterForm(forms.Form):
    email = forms.CharField(max_length=50)
    password = forms.CharField(widget=forms.PasswordInput)
    confirm = forms.CharField(widget=forms.PasswordInput)
    country = forms.ChoiceField(choices=COUNTRY_CHOICES, required=False)

    # Ελέγχω αν ο κωδικός επαλήθευσης ταιριάζει με τον κανονικό κωδικό
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm = cleaned_data.get("confirm")

        if password and confirm and password != confirm:
            raise forms.ValidationError("Passwords Mismatch.")
        
        return cleaned_data
    
    # Ελέγχω αν ο κωδικός είναι ισχυρός
    def clean_password(self):
        password = self.cleaned_data.get('password')

        if password:
            counter = 0
            if len(password) < 8:
                counter = 1
            if not re.search(r"[A-Z]", password):
                counter = 1
            if not re.search(r"[a-z]", password):
                counter = 1
            if not re.search(r"\d", password):
                counter = 1
            if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
                counter = 1
            if counter == 1:
                raise forms.ValidationError("Passwords must have at least 8 characters, 1 uppercase and lowercase letter, 1 digit, and 1 special character.")
        
        return password
    
    # Ελέγχω: α) αν το email είναι έγκυρο και β) αν υπάρχει στη βάση δεδομένων χρήστης με ίδιο email
    def clean_email(self):
        email = self.cleaned_data.get('email')
        pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'

        if email:
            if not re.match(pattern, email, re.IGNORECASE):
                raise forms.ValidationError("Invalid email address")
        
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("A user with the same email address is already registered.")
    
        return email
    
    # Ελέγχω αν ο χρήστης έγραψε μια χώρα από αυτές που υποστηρίζει το πρόγραμμα
    def clean_country(self):
        country = self.cleaned_data.get('country')

        valid_countries = [choice[0] for choice in COUNTRY_CHOICES]

        if country not in valid_countries:
            raise forms.ValidationError("This country is not supported.")

        return country