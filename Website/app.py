from flask import Flask, render_template, request, json, session, Response, jsonify
from responses import error_400_message, error_401_message, error_403_message, success_200_message
import os, cv2, datetime, base64, pickle
from datetime import timedelta
from common import grid_setting_file

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=300)
app.config['SESSION_PERMANENT'] = True

############################   backend   ############################
from engine import log_in
@app.route('/bk/user/login', methods=['POST'])
def bk_user_login():
	user_name = request.form.get('user_name')
	password = request.form.get('password')
	result_dict = log_in(user_name, password)
	if result_dict['statusCode'] == '200':
		id = result_dict.pop('id')
		email = result_dict.pop('email')
		session.clear()
		session['admin'] = (result_dict['message'] == 'admin')
		session['user_id'] = id
		session['user_email'] = email
		session['user_name'] = result_dict['user_name']
		if not os.path.isfile(grid_setting_file):
			session['grid_setting_info'] = [2, 3]
			grid_setting_info = {session['user_name']: session['grid_setting_info']}
			with open(grid_setting_file, 'wb') as file:
				pickle.dump(grid_setting_info, file)
		else:
			with open(grid_setting_file, 'rb') as file:
				grid_setting_info = pickle.load(file)
			if session['user_name'] not in grid_setting_info:
				session['grid_setting_info'] = [2, 3]
				grid_setting_info[session['user_name']] = session['grid_setting_info']
				with open(grid_setting_file, 'wb') as file:
					pickle.dump(grid_setting_info, file)
			else:
				session['grid_setting_info'] = grid_setting_info[session['user_name']]
		result_dict['grid_setting_info'] = session['grid_setting_info']
	return json.dumps(result_dict)

@app.route('/bk/gridSetting', methods=['Get'])
def bk_grid_setting_get():
	return json.dumps({'grid_setting_info': session['grid_setting_info']})

@app.route('/bk/gridSetting', methods=['PUT'])
def bk_grid_setting_update():
	rows = request.form.get('rows')
	cols = request.form.get('cols')
	with open(grid_setting_file, 'rb') as file:
		grid_setting_info = pickle.load(file)
	session['grid_setting_info'] = [rows, cols]
	grid_setting_info = {session['user_name']: session['grid_setting_info']}
	with open(grid_setting_file, 'wb') as file:
		pickle.dump(grid_setting_info, file)
	return json.dumps({'grid_setting_info': session['grid_setting_info']})

from sql import get_one_record
from sql import update_record
def check_user_name_exists(user_name, user_id=None):
	if user_id is None:
		sql_command = 'select `id` from `tbl_admin` where `name` = %s'
		params = user_name
	else:
		sql_command = 'select `id` from `tbl_admin` where `name` = %s and not `id` = %s'
		params = (user_name, user_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

#sql_command = 'select `id`, `password`, `name`, `email`, `register_date`, `role_id` from `tbl_admin` where `role_id` != 1'
@app.route('/bk/User', methods=['POST'])
def bk_user_add():
	user_name = request.form.get('name')
	email = request.form.get('email')
	password = request.form.get('password')
	role_id = request.form.get('role_id')
	if check_user_name_exists(user_name): return json.dumps(error_400_message('user_name'))
	sql_command = 'insert into `tbl_admin` (`name`, `email`, `register_date`, `password`, `role_id`) values (%s, %s, %s, %s, %s)'
	update_record(sql_command, (user_name, email, datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), password, role_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/User', methods=['PUT'])
def bk_user_edit():
	user_name = request.form.get('name')
	email = request.form.get('email')
	user_id = request.form.get('id')
	password = request.form.get('password')
	role_id = request.form.get('role_id')
	if check_user_name_exists(user_name, user_id): return json.dumps(error_400_message('user_name'))
	sql_command = 'update `tbl_admin` set `name` = %s, `email` = %s, `password` = %s, `role_id` = %s WHERE `id` = %s'
	update_record(sql_command, (user_name, email, password, role_id, user_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/User', methods=['DELETE'])
def bk_user_delete():
	user_id = request.form.get('id')
	sql_command = 'delete from `tbl_admin` WHERE `id` = %s'
	update_record(sql_command, user_id)
	return json.dumps(success_200_message('ok'))

def check_camera_name_exists(camera_name, camera_id=None):
	if camera_id is None:
		sql_command = 'select `id` from `cameras` where `camera_name` = %s'
		params = camera_name
	else:
		sql_command = 'select `id` from `cameras` where `camera_name` = %s and not `id` = %s'
		params = (camera_name, camera_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

def check_camera_url_exists(camera_url, camera_id=None):
	if camera_id is None:
		sql_command = 'select `id` from `cameras` where `camera_url` = %s'
		params = camera_url
	else:
		sql_command = 'select `id` from `cameras` where `camera_url` = %s and not `id` = %s'
		params = (camera_url, camera_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

#sql_command = 'select `id`, `camera_name`, `camera_url`, `server_url`, `state`, `location` from `cameras` where `user_id` = %s' % session['user_id']
@app.route('/bk/Camera', methods=['POST'])
def bk_camera_add():
	camera_name = request.form.get('camera_name').replace(' ', '')
	camera_url = request.form.get('camera_url')
	state = request.form.get('state')
	location = request.form.get('location')
	user_id = request.form.get('user_id')
	if user_id is None: user_id = session['user_id']
	if check_camera_name_exists(camera_name): return json.dumps(error_400_message('camera_name'))
	#if check_camera_url_exists(camera_url): return json.dumps(error_400_message('camera_url'))
	sql_command = 'insert into `cameras` (`camera_name`, `camera_url`, `state`, `location`, `user_id`) values (%s, %s, %s, %s, %s)'
	update_record(sql_command, (camera_name, camera_url, state, location, user_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Camera', methods=['PUT'])
def bk_camera_edit():
	camera_name = request.form.get('camera_name').replace(' ', '')
	camera_url = request.form.get('camera_url')
	camera_id = request.form.get('id')
	state = request.form.get('state')
	location = request.form.get('location')
	user_id = request.form.get('user_id')
	if user_id is None: user_id = session['user_id']
	if check_camera_name_exists(camera_name, camera_id): return json.dumps(error_400_message('camera_name'))
	#if check_camera_url_exists(camera_url, camera_id): return json.dumps(error_400_message('camera_url'))
	sql_command = 'update `cameras` set `camera_name` = %s, `camera_url` = %s, `state` = %s, `location` = %s, `user_id` = %s WHERE `id` = %s'
	update_record(sql_command, (camera_name, camera_url, state, location, user_id, camera_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Camera', methods=['DELETE'])
def bk_camera_delete():
	camera_id = request.form.get('id')
	sql_command = 'delete from `cameras` WHERE `id` = %s'
	update_record(sql_command, camera_id)
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Video', methods=['DELETE'])
def bk_Video_delete():
	camera_id = request.form.get('id')
	sql_command = 'delete from `videos` WHERE `id` = %s'
	update_record(sql_command, camera_id)
	return json.dumps(success_200_message('ok'))

def check_zone_name_exists(zone_name, zone_id=None):
	if zone_id is None:
		sql_command = 'select `id` from `zones` where `name` = %s and `user_id` = %s'
		params = (zone_name, session['user_id'])
	else:
		sql_command = 'select `id` from `zones` where `name` = %s and `user_id` = %s and not `id` = %s'
		params = (zone_name, session['user_id'], zone_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

@app.route('/bk/Zone', methods=['POST'])
def bk_zone_add():
	zone_name = request.form.get('name')
	if check_zone_name_exists(zone_name): return json.dumps(error_400_message('zone_name'))
	sql_command = 'insert into `zones` (`name`, `user_id`) values (%s, %s)'
	update_record(sql_command, (zone_name, session['user_id']))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Zone', methods=['PUT'])
def bk_zone_edit():
	zone_name = request.form.get('name')
	zone_id = request.form.get('id')
	if check_zone_name_exists(zone_name, zone_id): return json.dumps(error_400_message('zone_name'))
	sql_command = 'update `zones` set `name` = %s WHERE `id` = %s'
	update_record(sql_command, (zone_name, zone_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Zone', methods=['DELETE'])
def bk_zone_delete():
	zone_id = request.form.get('id')
	sql_command = 'delete from `zones` WHERE `id` = %s'
	update_record(sql_command, zone_id)
	return json.dumps(success_200_message('ok'))

############################   menu   ############################
usual_menu_items = ['Camera', 'Camera_View', 'Video', 'Log_out']
usual_menu_texts = ['Camera', 'Camera_View', 'Video', 'Log out']
admin_menu_items = ['User', 'Camera', 'Video', 'Log_out']
admin_menu_texts = ['User', 'Camera', 'Video', 'Log out']
@app.route('/bk/Menu', methods=['GET'])
def get_menu_item():
	if session.get('admin') is None:
		return json.dumps(error_403_message('not login'))
	menu_items = admin_menu_items if session['admin'] else usual_menu_items
	menu_texts = admin_menu_texts if session['admin'] else usual_menu_texts
	menu_dict = []
	for menu_item, menu_text in zip(menu_items, menu_texts):
		menu_dict.append({
			'id': menu_item,
			'text': menu_text,
			'link': "/" + menu_item
		})
	return json.dumps({'statusCode': 200, 'menu_items': menu_dict})

from sql import get_full_data
from sql import get_one_data
@app.route('/bk/User', methods=['GET'])
def bk_User():
	sql_command = 'select `id`, `password`, `name`, `email`, `register_date`, `role_id` from `tbl_admin` where `role_id` != 1'
	users = get_full_data(sql_command)
	sql_command = 'select `id`, `title` from `roles` where `id` != 1'
	roles = get_full_data(sql_command)
	return json.dumps({'users': users, 'roles': roles})

@app.route('/bk/Camera', methods=['GET'])
def bk_Camera():
	if session.get('admin') is False:
		sql_command = 'select `id`, `camera_name`, `camera_url`, `server_url`, `state`, `location`, `zone_id` from `cameras` where `user_id` = %s' % session['user_id']
		cameras = get_full_data(sql_command)
		sql_command = 'select `id`, `name` from `zones` where `user_id` = %s' % session['user_id']
		zones = get_full_data(sql_command)
		return json.dumps({'cameras': cameras, 'admin': False, 'zones': zones})
	sql_command = 'select `id`, `camera_name`, `camera_url`, `server_url`, `state`, `location`,`user_id` from `cameras`'
	cameras = get_full_data(sql_command)
	sql_command = 'select `id`, `name` from `tbl_admin` where `role_id` != 1'
	users = get_full_data(sql_command)
	return json.dumps({'cameras': cameras, 'admin': True, 'users': users})

@app.route('/bk/Camera_View', methods=['GET'])
def bk_Camera_View():
	sql_command = 'select `id`, `name` from `zones` where `user_id` = %s' % (session['user_id'])
	zones = get_full_data(sql_command)
	zone_ids = {}
	for i, zone in enumerate(zones):
		zone['ID'] = "1_" + str(i + 1)
		zone['categoryId'] = "1"
		zone['camera_name'] = zone['name']
		zone_ids[zone['id']] = zone['ID']
	sql_command = 'select `camera_name`, `camera_url`, `zone_id` from `cameras` where `user_id` = %s and state = %s' % (session['user_id'], '1')
	cameras = get_full_data(sql_command)
	for i, camera in enumerate(cameras):
		camera['ID'] = zone_ids[camera['zone_id']] + '_' + str(i + 1)
		camera['categoryId'] = zone_ids[camera['zone_id']]
	cameras.insert(0, {
		'ID': "1",
		'camera_name': "cameras",
		'expanded': True
	})
	return json.dumps(cameras + zones)

@app.route('/bk/Video', methods=['GET'])
def bk_Video():
	timeline = request.args.get('timeline')
	if timeline is not None:
		if timeline == 'All':
			sql_command = 'SELECT videos.*, cameras.`camera_name`, cameras.`location` FROM (SELECT * FROM `videos`) videos LEFT JOIN cameras ON videos.`camera_id` = cameras.`id` ORDER BY `start_time` DESC;'
		elif timeline == 'Today':
			sql_command = 'SELECT videos.*, cameras.`camera_name`, cameras.`location` FROM (SELECT * FROM `videos`) videos LEFT JOIN cameras ON videos.`camera_id` = cameras.`id` WHERE DATE(`start_time`) = DATE(NOW()) ORDER BY `start_time` DESC;'
		elif timeline == 'This Week':
			sql_command = 'SELECT videos.*, cameras.`camera_name`, cameras.`location` FROM (SELECT * FROM `videos`) videos LEFT JOIN cameras ON videos.`camera_id` = cameras.`id` WHERE WEEK(`start_time`) = WEEK(NOW()) and YEAR(`start_time`) = YEAR(NOW()) ORDER BY `start_time` DESC;'
		elif timeline == 'This Month':
			sql_command = 'SELECT videos.*, cameras.`camera_name`, cameras.`location` FROM (SELECT * FROM `videos`) videos LEFT JOIN cameras ON videos.`camera_id` = cameras.`id` WHERE MONTH(`start_time`) = MONTH(NOW()) and YEAR(`start_time`) = YEAR(NOW()) ORDER BY `start_time` DESC;'
		elif timeline == 'This Year':
			sql_command = 'SELECT videos.*, cameras.`camera_name`, cameras.`location` FROM (SELECT * FROM `videos`) videos LEFT JOIN cameras ON videos.`camera_id` = cameras.`id` WHERE YEAR(`start_time`) = YEAR(NOW()) ORDER BY `start_time` DESC;'
	else:
		sql_command = 'SELECT videos.*, cameras.`camera_name`, cameras.`location` FROM (SELECT * FROM `videos`) videos LEFT JOIN cameras ON videos.`camera_id` = cameras.`id` WHERE {} ORDER BY `start_time` DESC;'.format(request.args.get('where_cmd'))
	cameras = get_full_data(sql_command)
	return json.dumps(cameras)

############################   web pages   ############################
@app.route('/')
def main_register():
	return render_template('index.html')

def load_page(param):
	if session.get('admin') is None:
		return render_template('index.html')
	if session['admin']:
		if param in admin_menu_items:
			if param == 'Camera': return render_template('Camera_admin.html')
			return render_template('{}.html'.format(param))
	else:
		if param in usual_menu_items: return render_template('{}.html'.format(param))
	return render_template('empty.html')

@app.route('/User')
def fr_User():
	return load_page('User')

@app.route('/Camera')
def fr_Camera():
	return load_page('Camera')

@app.route('/Camera_View')
def fr_Camera_View():
	return load_page('Camera_View')

@app.route('/Video')
def fr_Video():
	return load_page('Video')

@app.route('/Log_out')
def Log_out():
	session.clear()
	return render_template('index.html')

############################   Alarm   ############################
@app.route('/api/CameraDisconnect', methods=['POST'])
def api_cameraDisconnect():
	camera_id = request.form.get('camera_id')
	type = 'camera disconnect'
	sql_command = 'SELECT aa.*, tbl_admin.`email` FROM (SELECT * FROM cameras WHERE `id`=%s) aa LEFT JOIN tbl_admin ON aa.`user_id` = tbl_admin.`id`'
	params = (camera_id)
	num, record = get_one_record(sql_command, params)
	content = 'Camera "{}" with url of "{}" disconnected'.format(record[1], record[2])
	user_email = record[-1]
	sql_command = 'insert into `notifications` (`type`, `content`, `user_email`) values (%s, %s, %s)'
	update_record(sql_command, (type, content, user_email))
	return json.dumps({'statusCode': 200})

from sql import get_records
from engine import mail_send
@app.route('/bk/GetNewAlarmNumber', methods=['GET'])
def api_GetNewAlarmNumber():
	if session.get('user_email') is None: return "0"
	sql_command = 'select * from `notifications` where user_email = %s and checked = %s'
	params = (session['user_email'], 0)
	records = get_records(sql_command, params)
	updated_sql_command = 'update `notifications` set `mail_sent` = %s where `id` = %s'
	body = ''
	for record in records:
		if (datetime.datetime.now() - record[3]).seconds / 3600 > 8 and record[-1] == 0:
			body += '{} at {} {}.'.format(record[2], record[3].strftime('%I:%M:%S %p'), record[3].strftime("%B %d, %Y"))
			update_record(updated_sql_command, (1, record[0]))
	# send mail
	if len(body) > 0: mail_send(session['user_email'], record[1], body)
	return str(len(records))

@app.route('/Alarm/GetAllAlarmCategory', methods=['GET'])
def bk_GetAllAlarmCategory():
	sql_command = 'select * from `notifications` where `user_email` = "%s" and `checked` = %s' % (session['user_email'], 0)
	updated_sql_command = 'update `notifications` set `checked` = %s where `user_email` = %s and `checked` = %s'
	result = get_full_data(sql_command)
	update_record(updated_sql_command, (1, session['user_email'], 0))
	return json.dumps(result)

if __name__ == "__main__":
	app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
