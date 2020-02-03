from channels import Group
from channels.auth import http_session_user, channel_session_user, channel_session_user_from_http

def get_group(username):
  return 'doctor-drch-grp-' + username

@channel_session_user_from_http
def ws_connect(message):
    # Accept the incoming connection
    message.reply_channel.send({"accept": True})
    group = get_group(message.user.username)
    Group(group).add(message.reply_channel)
    Group(group).send({'text': message.user.username})

@channel_session_user
def ws_receive(message):
    label = message.channel_session['doctor']
    data = json.loads(message['text'])
    group = get_group(message.user.username)
    Group(group).send({'text': message.user.username})

@channel_session_user
def ws_disconnect(message):
    group = get_group(message.user.username)
    group = 'doctor' + message.user.username
    Group(group).discard(message.reply_channel)