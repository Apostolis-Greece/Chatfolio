
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

print("\t[DEBUG] EmailBackend module loaded")

User = get_user_model()

# Αυτή η κλάση χρειάζεται για να γίνεται σύνδεση χρήστη με email και όχι με username που είναι το Django default
class EmailBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        print(f"\t[DEBUG] Authenticating email={email}, password={password}")
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                print("\t[DEBUG] Password matched")
                return user
            else:
                print("\t[DEBUG] Password mismatch")
        except User.DoesNotExist:
            print("\t[DEBUG] User not found")
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None