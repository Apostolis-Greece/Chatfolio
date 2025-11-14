
'''
    ΠΡΟΣΟΧΗ 1
        user.id:    Είναι το primary key του χρήστη στη βάση δεδομένων
                    Αν φτιάξω τον media folder με βάση αυτό θα υπάρχει σωστός
                    συγχρονισμός μεταξύ Βάσης Δεδομένων και Filesystem

        i:          Είναι μια μεταβλητή του bulk_load_fake_users.py
                    Αν ο χρήστης στη βάση δεδομένων έχει user.id και στο media folder έχει i
                    τότε θα προκληθεί μετά από καιρό ασυνέπεια μεταξύ Βάσης Δεδομένων και Filesystem

        Πρέπει να δημιουργώ φακέλους media/user_<id>/ και όχι media/user_<i>/
        
        Παράδειγμα
            bubk_load 100 χρήστες:
                {user.id=1 , media/user_1}
                {user.id=2 , media/user_2}
                {user.id=3 , media/user_3}
                ....
                {user.id=100 , media/user_100}

            Εγγραφή χρήστη στην από το website
                {user.id=101 , media/user_101}

            bubk_load 100 χρήστες:
                {user.id=102 , media/user_1}
                {user.id=103 , media/user_2}
                {user.id=104 , media/user_3}
                ....
                {user.id=201 , media/user_100}

            Έχουμε ασυνέπεια μεταξύ Βάσης Δεδομένων και Filesystem !!!
            Δηλ. όταν ο user.id=102 θα κάνει login θα βλέπει τα media files από άλλον χρήστη !!!
            Αυτό συμβαίνει διότι το "primary key id" είναι ένας διαρκής αύξων αριθμός,
            ενώ ο μετρητής "i" κάνει reset στην τιμή 1 κάθε φορά που τρέχει το bulk_load_fake_users.py

    ΠΡΟΣΟΧΗ 2
        Τα emails έχουν τη μορφή {randomName}_{i}@fake.com
        Το "i" είναι μια μεταβλητή του bulk_load_fake_users.py και κάνει reset στην τιμή 1 κάθε φορά που το ξανά τρέχω
        Για αυτό το λόγο, η διαδικασία Bulk Load θα πρέπει να γίνει μόνο 1 φορά!
'''

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import csv, os, hashlib, random, secrets, string
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont
from django.db import transaction


class Command(BaseCommand):
    help = "Create and Bulk Load Fake Users"
    
    def add_arguments(self, parser):
        # Παράμετρος --number
        parser.add_argument(
            '--number',
            type = int,
            default = 2, # default τιμή
            help = 'Number of fake users to create'
    )

    def handle(self, *args, **options):
        countries = [
            "", "Argentina", "Armenia", "Australia", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
            "Brazil", "Bulgaria", "Canada", "China", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Egypt",
            "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland", "India", "Ireland",
            "Italy", "Japan", "Latvia", "Lithuania", "Luxembourg", "Malta", "Moldova", "Montenegro", "Netherlands",
            "New Zealand", "Norway", "Poland", "Portugal", "Romania", "Russia", "Serbia", "Slovakia", "Slovenia",
            "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "England", "United States",
        ]
        greekNames = [
            "Αλέξανδρος", "Αναστασία", "Άγγελος", "Άννα", "Αχιλλέας", "Αθανασία", "Αντώνης", "Αικατερίνη", "Αριστοτέλης",
            "Ασπασία", "Αδόνις", "Αμαλία", "Απόστολος", "Άνθη", "Άρης", "Αλεξία", "Αθηνά", "Ανδρέας", "Αγγελική", "Αλέκος",
            "Βασίλης", "Βασιλική", "Μπάμπης", "Βενιαμίν", "Βασίλειος", "Βασιλεία", "Βαγγέλης", "Χρήστος", "Χαρά", "Κωνσταντίνος",
            "Χριστίνα", "Χαράλαμπος", "Χρυσούλα", "Χριστόδουλος", "Χρυσάνθη", "Κατερίνα", "Χριστόφορος", "Χρύσα", "Χρυσόστομος", "Χρυσάνθος", "Χρυσή", "Χάρης", "Δέσποινα", "Διονύσιος", "Δάφνη", "Δήμητρα", "Δημήτριος", "Διονυσία", "Ηλίας", "Ελένη", "Ευάγγελος", "Ευαγγελία", "Ευθύμιος", "Ειρήνη", "Εμμανουήλ", "Ευρυδίκη", "Ευφροσύνη", "Ελευθέριος", "Ελπίδα", "Εύα", "Ευστάθιος", "Ευτυχία", "Φώτης", "Φωτεινή", "Φίλιππος", "Φανή", "Φοίβος", "Φλώρα", "Φωτούλα", "Φιλοθέη", "Γεώργιος", "Γεωργία", "Γιάννης", "Γρηγόρης", "Γεράσιμος", "Γλυκερία", "Ισμήνη", "Ιάκωβος", "Ιωάννα", "Ιφιγένεια", "Ιάσων", "Ιωνάς", "Κώστας", "Κυριάκος", "Κωνσταντίνα", "Κλεοπάτρα", "Καλλιόπη", "Κλειώ", "Κλεονίκη", "Κυριακούλα", "Λευτέρης", "Λυδία", "Λεωνίδας", "Λάμπρος", "Λάζαρος", "Λουκάς", "Λουκία", "Μιχάλης", "Μαρία", "Μάριος", "Μαρίνα", "Μανώλης", "Μάγδα",
            "Μάκης", "Μελίνα", "Μιλτιάδης", "Μαριλένα", "Μαργαρίτα", "Μυρτώ", "Μάρκος", "Ματίνα", "Νικόλαος", "Νεφέλη", "Νίκη", "Νικηφόρος", "Νατάσα", "Οδυσσέας", "Ολυμπία", "Ορέστης", "Ουρανία", "Ορφέας", "Όλγα", "Παναγιώτης", "Πηνελόπη", "Πάνος", "Παρασκευή", "Παύλος", "Πέτρος", "Παντελής", "Περικλής", "Ράνια", "Ραφαήλ", "Στέφανος", "Σοφία", "Σπύρος", "Σταύρος", "Στέλλα", "Σωτήρης", "Σάββας", "Σωτηρία", "Σάραντος", "Θωμάς", "Θάνος", "Τάκης", "Θέμης", "Θεόδωρος", "Θεόφιλος", "Βάσω", "Ζωή", "Ζήσης", "Ζαφείρης", "Ζαχαρίας", "Ζάνος"
        ]
        defaultPhotoPath = os.path.join(settings.STATIC_ROOT, 'photos', 'default-profile.png')
        N = options['number'] # Παίρνουμε την τιμή της παραμέτρου που δίνεται από τη γραμμή εντολών
        #self.stdout.write(f"It is about to create {N} fake users")

        try:
            for i in range(1, N + 1):
                # 1. Εγγραφή του νέου χρήστη στη βάση δεδομένων με στοιχεία {username, email, country, password}
                email = generate_random_email(i, N, greekNames)
                username = get_username(email)
                country = generate_random_country(countries)
                password = generate_random_password(i, N, 8)
                                            
                User = get_user_model()
                # Αν υπάρχει τέτοιος χρήστης δεν κάνω τίποτα (ούτε νέα εγγραφή στη ΒΔ ούτε media folder)
                if User.objects.filter(email = email).exists():
                    self.stderr.write(f"Error: A such user exists in the database: {user}")
                    continue

                try:
                    with transaction.atomic():
                        user = User.objects.create_user(
                            username = username,
                            email = email,
                            password = password,
                            country = country
                        )
                        #self.stdout.write(f"Created user: {user}")

                        # 2. Δημιουργία φακέλου: media/user_<id>/
                        user_id = user.id
                        user_id_str = str(user_id)
                        user_email = user.email
                        user_email_str = str(user_email)

                        label = f"user_{user_id_str}"
                        folder_path = os.path.join(settings.MEDIA_ROOT, label)
                        os.makedirs(folder_path, exist_ok=True)
                        #self.stdout.write(f"Created media folder: {folder_path}")

                        # 3. Δημιουργία φωτογραφίας προφίλ: user_<id>
                        # Μέγεθος Γραμματοσειράς
                        try:
                            font = ImageFont.truetype("arial.ttf", 150)
                        except IOError:
                            try:
                                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 150)
                            except IOError:
                                font = ImageFont.load_default()

                        img = Image.open(defaultPhotoPath).convert("RGBA")
                        draw = ImageDraw.Draw(img)

                        # Υπολογισμός διαστάσεων κειμένου
                        try:
                            bbox = draw.textbbox((0,0), user_email_str, font=font)
                            text_w = bbox[2] - bbox[0]
                            text_h = bbox[3] - bbox[1]
                        except AttributeError:
                            text_w, text_h = len(user_email_str) * 10, 20

                        # Κάτω-κάτω στο κέντρο (με μικρό περιθώριο)
                        x = (img.width - text_w) / 2
                        y = img.height - text_h - 200

                        # Προσθήκη ημιδιαφανούς φόντου πίσω από το κείμενο
                        #bg_margin_x = 20
                        #bg_margin_y = 10
                        #rect_coords = [
                        #    x - bg_margin_x, 
                        #    y - bg_margin_y, 
                        #    x + text_w + bg_margin_x, 
                        #    y + text_h + bg_margin_y
                        #]
                        #draw.rectangle(rect_coords, fill=(0, 0, 0, 150))

                        # Σκιά + λευκό κείμενο
                        draw.text((x + 3, y + 3), user_email_str, font=font, fill=(0, 0, 0, 255))
                        draw.text((x, y), user_email_str, font=font, fill=(255, 255, 255, 255))

                        # Αποθήκευση στο φάκελο
                        new_filename = os.path.join(folder_path, f"{label}.png")
                        img.save(new_filename)
                        #self.stdout.write(f"Created: {new_filename}")

                        # Ενημερώνουμε το πεδίο profile_image του χρήστη με το σωστό path
                        user.profile_image = f"{label}/{label}.png"
                        user.save(update_fields=['profile_image'])
                        #raise Exception
                except Exception as e:
                    self.stderr.write(f'Error creating user {username}: {e}')

        except Exception as e:
            self.stderr.write(f'Error: {e}')
        
        self.stdout.write("Successfull Finish")




############################################################### Functions
def generate_random_email(i, N, greekNames):
    randomName = str(random.choice(greekNames))
    return f"{randomName}_{i}@fake.com"


def generate_random_password(i, N, length=8):
    return "1234"

    #if length < 8:
    #    raise ValueError("Password length must contain at least 8 characters")

    # σύνολα χαρακτήρων
    #upper = string.ascii_uppercase
    #lower = string.ascii_lowercase
    #digits = string.digits
    #special = "!@#$%^&*()-_=+[]{};:,.<>?/`~"

    # εξασφαλίζουμε 1 από κάθε κατηγορία
    #pw_chars = [
    #    secrets.choice(upper),
    #    secrets.choice(lower),
    #    secrets.choice(digits),
    #    secrets.choice(special)
    #]

    # υπόλοιπα chars επιλέγονται από το συνδυασμένο σύνολο
    #all_chars = upper + lower + digits + special
    #for _ in range(length - len(pw_chars)):
    #    pw_chars.append(secrets.choice(all_chars))

    # ανακάτεμα με SystemRandom για ασφαλές shuffle
    #secrets.SystemRandom().shuffle(pw_chars)
    #return ''.join(pw_chars)


def get_username(email):
    email = str(email)
    username = email.rsplit('@', 1)
    return username[0] if len(username) == 2 else ''


def generate_random_country(countries):
    return random.choice(countries)