
from django.contrib.auth import authenticate
from django import forms
import re
import hashlib


class LoginForm(forms.Form):
    email = forms.CharField(max_length=50)
    password = forms.CharField(widget=forms.PasswordInput)

    # Ελέγχω αν ο χρήστης έδωσε σωστά credentials (δηλ. αν υπάρχει στη βάση δεδομένων τέτοιος χρήστης)
    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get("email")
        password = cleaned_data.get("password")

        if email and password:
            user = authenticate(request=None, email=email, password=password)
            if user is None:
                raise forms.ValidationError("False Credentials. Please try again.")
            self.user = user # αποθηκεύω τον authenticated_user για τον χρησιμοποιήσω στο login view
            
        return cleaned_data

    # Ελέγχω: α) αν το email είναι έγκυρο
    def clean_email(self):
        email = self.cleaned_data.get('email')
        pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'
        
        if email:
            if not re.match(pattern, email, re.IGNORECASE):
                raise forms.ValidationError("Invalid email address")
            
        return email