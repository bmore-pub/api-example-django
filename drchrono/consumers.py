from channels import Group
from channels.sessions import channel_session

@channel_session
def ws_connect(message):
    # Accept the incoming connection
    message.reply_channel.send({"accept": True})
    Group("doctor").add(message.reply_channel)

@channel_session
def ws_receive(message):
    label = message.channel_session['doctor']
    data = json.loads(message['text'])
    Group('doctor').send({'text': json.dumps(data)})

@channel_session
def ws_disconnect(message):
    Group('doctor').discard(message.reply_channel)