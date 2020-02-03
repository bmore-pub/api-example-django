from django.db import models
from django.template.defaultfilters import slugify
from django.contrib.auth.models import User
from django.db.models import Avg
# Add your models here

# helpers
def status_is_waiting(status):
    if status in ['In Room','Arrived', 'Checked In', 'Checked In Online']:
        return True
    else:
        return False

def get_datetime(time):
    return datetime.strptime(time, '%Y-%m-%dT%H:%M:%S')

class AppointmentStatusChange(models.Model):
    appointment_id = models.BigIntegerField()
    patient_id = models.BigIntegerField()
    next_status = models.TextField()
    event_time  = models.DateTimeField()

    @staticmethod
    def create_appointment_status(event, created_at, data):
        filter_item = {
            'appointment_id': data['id'],
            'patient_id': data['patient'],
        }

        status_change_count_for_patient = AppointmentStatusChange.objects.filter(**filter_item).count()
        last_status_query = AppointmentStatusChange.objects.filter(**filter_item).order_by('-event_time')

        # TODO refactor
        if status_change_count_for_patient > 0:
            status_result = last_status_query[0]
            if status_is_waiting(status_result.next_status):
                event_time = status_result.event_time
                created_time = get_datetime(created_at)
                created_time = created_time.replace(tzinfo=event_time.tzinfo)
                updated_time = (created_time - status_result.event_time).seconds * 1000
                PatientWaiting.create_or_update(data['patient'], data['id'], data['doctor'], updated_time)

        # TODO could be more clever about not always creating on update
        filter_item['event_time'] = created_at
        filter_item['next_status'] = data['status']
        new_status_change = AppointmentStatusChange(**filter_item)
        new_status_change.save()

class PatientWaiting(models.Model):
    patient_id = models.BigIntegerField()
    appointment_id = models.BigIntegerField()
    time_waiting = models.BigIntegerField()
    doctor_id = models.BigIntegerField()

    @staticmethod
    def create_or_update(patient_id, appointment_id, doctor_id, time_waiting):
        filter_item = {
            'doctor_id': doctor_id,
            'appointment_id': appointment_id,
            'patient_id': patient_id
        }
        items = PatientWaiting.objects.filter(**filter_item)
        if items.count() == 0:
            filter_item['time_waiting'] = time_waiting
            new_waiting_item = PatientWaiting(**filter_item)
            new_waiting_item.save()
        else:
            patient_waiting = items.get()
            old_time_waiting = patient_waiting.old_time_waiting
            new_waiting = time_waiting + old_time_waiting
            PatientWaiting.objects.filter(**filter_item).update(time_waiting=new_waiting)

    @staticmethod
    def average_wait_time(doctor_id):
        return PatientWaiting.objects.filter(doctor_id=doctor_id).aggregate(Avg('time_waiting')).get("time_waiting__avg")