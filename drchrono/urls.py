from django.conf.urls import include, url
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from django.contrib import admin
admin.autodiscover()

import views


urlpatterns = [
    url(r'^setup/$', views.SetupView.as_view(), name='setup'),
    url(r'^main/$', views.ReactView.as_view(), name='react-review'),
    url(r'^get-appointments/$', views.get_appointment_data, name='get-appointments'),
    url(r'^get-doctor/$', views.get_doctor_data, name='get-doctor'),
    url(r'^update-appointment/$', views.update_appointment, name='update-appointment'),
    url(r'^hook-endpoint/', views.hook_endpoint, name='hook-endpoint'),
    url(r'^data-endpoint/', views.data_endpoint, name='data-endpoint'),
    url(r'', include('social.apps.django_app.urls', namespace='social')),
]
