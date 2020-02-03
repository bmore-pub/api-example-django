from django.db import models
from django.template.defaultfilters import slugify
from django.contrib.auth.models import User
from django.db.models import Avg
# Add your models here

class AppointmentStatusChange(models.Model):
    appointment_id = models.BigIntegerField()
    patient_id = models.BigIntegerField()
    next_status = models.TextField()
    event_time  = models.DateTimeField()

class PatientWaiting(models.Model):
    patient_id = models.BigIntegerField()
    appointment_id = models.BigIntegerField()
    time_waiting = models.BigIntegerField()
    doctor_id = models.BigIntegerField()

    @staticmethod
    def average_wait_time(doctor_id):
        return PatientWaiting.objects.filter(doctor_id=doctor_id).aggregate(Avg('time_waiting')).get("time_waiting__avg")