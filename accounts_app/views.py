
from django.contrib.auth import get_user_model
User = get_user_model()


########################### Clean Code: Απομονώνω την κάθε όψη σε ξεχωριστό αρχείο
from .view_modules.register_views import register_view
from .view_modules.login_views import login_view
from .view_modules.logout_views import logout_view
from .view_modules.termsAndConditions_views import termsAndConditions_view
from .view_modules.forgotPassword_views import forgotPassword_view
from .view_modules.homepage_views import homepage_view


########################### 404 View
from django.shortcuts import render

# Το αρχείο 404.html θα το βρει απο τους φακέλους "templates" του κάθε app ή από τον φάκελο "BASE_DIR/templates",
# διότι το έχω ρυθμίσει στο settings.py ως εξής: "TEMPLATES = [... 'DIRS': [BASE_DIR / 'templates',]"
def error_404(request, exception):
    return render(request, '404.html', status=404)