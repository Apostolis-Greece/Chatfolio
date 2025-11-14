"""
URL configuration for Chatfolio project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from . import views

urlpatterns = [
    # URL, Όψη στο back-end που χειρίζεται το αίτημα, Alias για το html href = "{% url '....' %}"
    path('', views.homepage_view, name='homepage_view'),
    path('login/', views.login_view, name='login_view'),
    path('logout/', views.logout_view, name='logout_view'),
    path('register/', views.register_view, name='register_view'),
    path('forgotPassword/', views.forgotPassword_view, name='forgotPassword_view'),
    path('termsAndConditions/', views.termsAndConditions_view, name='termsAndConditions_view'),
]