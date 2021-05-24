from flask import Flask, render_template, request, json, session, Response
from responses import error_400_message, error_401_message, error_403_message, success_200_message
from datetime import timedelta
import subprocess

app = Flask(__name__)

from sql import get_full_data
from sql import get_one_record

sql_command = 'select `id`, `camera_name`, `camera_url`, `server_url`, `state`, `location`,`user_id` from `cameras`'
cameras = get_full_data(sql_command)
proc_dict = {}
for camera in cameras:
	if camera['state'] == 1:
		command = 'gst-launch-1.0.exe rtspsrc protocols=tcp location="' + camera['camera_url'] + '" ! rtph264depay ! h264parse ! mpegtsmux ! hlssink location='\
			+ camera['camera_name'] + '.%05d.ts playlist-location=' + camera['camera_name'] + '.m3u8'
		proc = subprocess.Popen(command)
		proc_dict[camera['id']] = proc


@app.route('/api/playAllCamera', methods=['POST'])
def playAllCamera():
	sql_command = 'select `id`, `camera_name`, `camera_url`, `server_url`, `state`, `location`,`user_id` from `cameras`'
	cameras = get_full_data(sql_command)
	for camera in cameras:
		if camera['state'] == 1:
			if camera['id'] in proc_dict:
				if proc_dict[camera['id']] is None:
					command = 'gst-launch-1.0.exe rtspsrc protocols=tcp location="' + camera[
						'camera_url'] + '" ! rtph264depay ! h264parse ! mpegtsmux ! hlssink location=' \
							  + camera['camera_name'] + '.%05d.ts playlist-location=' + camera['camera_name'] + '.m3u8'
					proc = subprocess.Popen(command)
					proc_dict[camera['id']] = proc
			else:
				command = 'gst-launch-1.0.exe rtspsrc protocols=tcp location="' + camera[
					'camera_url'] + '" ! rtph264depay ! h264parse ! mpegtsmux ! hlssink location=' \
						  + camera['camera_name'] + '.%05d.ts playlist-location=' + camera['camera_name'] + '.m3u8'
				proc = subprocess.Popen(command)
				proc_dict[camera['id']] = proc
		else:
			if camera['id'] in proc_dict:
				if proc_dict[camera['id']] is not None:
					proc_dict[camera['id']].kill()
					proc_dict[camera['id']] = None

	return json.dumps({'code': 200})


@app.route('/api/playOneCamera', methods=['POST'])
def playOneCamera():
	camera_id = request.form.get('id')
	sql_command = 'SELECT `camera_name`, `camera_url`, `server_url`, `state`, `location`,`user_id` FROM cameras WHERE `id`=%s'
	params = (camera_id)
	num, record = get_one_record(sql_command, params)
	camera_name = record[0]
	camera_url = record[1]
	if camera_id in proc_dict :
		if proc_dict[camera_id] is None:
			command = 'gst-launch-1.0.exe rtspsrc protocols=tcp location="' + camera_url + '" ! rtph264depay ! h264parse ! mpegtsmux ! hlssink location=' \
					  + camera_name + '.%05d.ts playlist-location=' + camera_name + '.m3u8'
			proc_dict[camera_id] = subprocess.Popen(command)
	else :
		command = 'gst-launch-1.0.exe rtspsrc protocols=tcp location="' + camera_url + '" ! rtph264depay ! h264parse ! mpegtsmux ! hlssink location=' \
				  + camera_name + '.%05d.ts playlist-location=' + camera_name + '.m3u8'
		proc_dict[camera_id] = subprocess.Popen(command)
	return json.dumps({'code': 200})

@app.route('/api/disconnectCamera', methods=['POST'])
def disconnectCamera():
	camera_id = request.form.get('id')
	if camera_id in proc_dict:
		if proc_dict[camera_id] is not None:
			proc_dict[camera_id].kill()
			proc_dict[camera_id] = None
	return json.dumps({'code': 200})
if __name__ == "__main__":
	app.run(debug=False, host='0.0.0.0', port=5001, threaded=True)
