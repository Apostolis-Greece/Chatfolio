
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class MyUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Κρυπτογράφιση password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)

COUNTRY_CHOICES = [
    ("", " "), ("Argentina", "Argentina"), ("Armenia", "Armenia"), ("Australia", "Australia"),
    ("Austria", "Austria"), ("Belarus", "Belarus"), ("Belgium", "Belgium"),
    ("Bosnia and Herzegovina", "Bosnia and Herzegovina"), ("Brazil", "Brazil"),
    ("Bulgaria", "Bulgaria"), ("Canada", "Canada"), ("China", "China"), ("Croatia", "Croatia"),
    ("Cyprus", "Cyprus"), ("Czech Republic", "Czech Republic"), ("Denmark", "Denmark"),
    ("Egypt", "Egypt"), ("Estonia", "Estonia"), ("Finland", "Finland"), ("France", "France"),
    ("Georgia", "Georgia"), ("Germany", "Germany"), ("Greece", "Greece"), ("Hungary", "Hungary"),
    ("Iceland", "Iceland"), ("India", "India"), ("Ireland", "Ireland"), ("Italy", "Italy"),
    ("Japan", "Japan"), ("Latvia", "Latvia"), ("Lithuania", "Lithuania"),
    ("Luxembourg", "Luxembourg"), ("Madagascar", "Madagascar"), ("Malta", "Malta"),
    ("Moldova", "Moldova"), ("Montenegro", "Montenegro"), ("Netherlands", "Netherlands"),
    ("New Zealand", "New Zealand"), ("Norway", "Norway"), ("Poland", "Poland"),
    ("Portugal", "Portugal"), ("Romania", "Romania"), ("Russia", "Russia"), ("Serbia", "Serbia"),
    ("Slovakia", "Slovakia"), ("Slovenia", "Slovenia"), ("South Africa", "South Africa"),
    ("Spain", "Spain"), ("Sweden", "Sweden"), ("Switzerland", "Switzerland"),
    ("Turkey", "Turkey"), ("Ukraine", "Ukraine"), ("England", "England"), ("United States", "United States"),
]

'''
    Όταν ο χρήστης ανεβάζει δική του φωτογραφία, αυτή θα αποθηκεύεται πάντα
    στο δικό του media folder και θα μετονομάζεται πάντα: user_<id>/user_<id>.png
'''
def user_directory_path(instance, filename):
    extension = filename.split('.')[-1]
    filename = f'user_{instance.id}.{extension}'
    return f'user_{instance.id}/{filename}'


class MyUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, choices=COUNTRY_CHOICES, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    profile_image = models.ImageField(
        upload_to = user_directory_path, # Το relative path που ακολουθεί μετά το MEDIA_ROOT που όρισα στο settings.py
        blank = True, null = True
    )

    objects = MyUserManager()

    USERNAME_FIELD = 'email' # Σύνδεση με email και όχι με username
    REQUIRED_FIELDS = []  # Υποχρεωτικά για τη δημιουργία ενός superuser

    def __str__(self):
        return self.email
    
    # Το όνομα του πίνακα στη βάση δεδομένων
    class Meta:
        db_table = 'USERS'