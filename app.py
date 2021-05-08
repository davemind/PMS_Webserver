from flask import Flask, render_template, request, json, session, Response
from responses import error_400_message, error_401_message, error_403_message, success_200_message
import os, cv2, datetime, base64
from datetime import timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
app.config['SESSION_PERMANENT'] = True


############################   backend   ############################
from engine import log_in
@app.route('/bk/user/login', methods=['POST'])
def bk_user_login():
	user_name = request.form.get('user_name')
	password = request.form.get('password')
	result_dict = log_in(user_name, password)
	if result_dict['statusCode'] == '200':
		session.clear()
		session['admin'] = (result_dict['message'] == 'admin')
		session['user_name'] = user_name
		#print(session)
	#print(user_name, password, result_dict)
	return json.dumps(result_dict)

from sql import get_one_record
def bk_group_check_name(group_name, group_id=None):
	if group_id is None:
		sql_command = 'select `id` from `groups` where `name` = %s'
		params = group_name
	else:
		sql_command = 'select `id` from `groups` where `name` = %s and not `id` = %s'
		params = (group_name, group_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

from sql import update_record
@app.route('/bk/Group', methods=['POST'])
def bk_group_add():
	group_name = request.form.get('group_name')
	if bk_group_check_name(group_name): return json.dumps(error_400_message('group_name'))
	sql_command = 'insert into `groups` (`name`) values (%s)'
	update_record(sql_command, group_name)
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Group', methods=['PUT'])
def bk_group_edit():
	group_name = request.form.get('group_name')
	group_id = request.form.get('group_id')
	if bk_group_check_name(group_name, group_id): return json.dumps(error_400_message('group_name'))
	sql_command = 'update `groups` set `name` = %s WHERE `id` = %s'
	update_record(sql_command, (group_name, group_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Group', methods=['DELETE'])
def bk_group_delete():
	group_id = request.form.get('group_id')
	sql_command = 'delete from `groups` WHERE `id` = %s'
	update_record(sql_command, group_id)
	sql_command = 'delete from `camera_group` WHERE `group_id` = %s'
	update_record(sql_command, group_id)
	return json.dumps(success_200_message('ok'))

@app.route('/bk/CameraGroup', methods=['POST'])
def bk_camera_group_add():
	group_id = request.form.get('group_id')
	camera_id = request.form.get('camera_id')
	sql_command = 'select `id` from `camera_group` where `group_id` = %s and `camera_id` = %s'
	num, _ = get_one_record(sql_command, (group_id, camera_id))
	if num > 0: return json.dumps(error_400_message('camera_id'))
	sql_command = 'insert into `camera_group` (`group_id`, `camera_id`) values (%s, %s)'
	update_record(sql_command, (group_id, camera_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/CameraGroup', methods=['PUT'])
def bk_camera_group_edit():
	group_id = request.form.get('group_id')
	new_camera_id = request.form.get('new_camera_id')
	old_camera_id = request.form.get('old_camera_id')
	sql_command = 'select `id` from `camera_group` where `group_id` = %s and `camera_id` = %s'
	num, _ = get_one_record(sql_command, (group_id, new_camera_id))
	if num > 0: return json.dumps(error_400_message('camera_id'))
	sql_command = 'update `camera_group` set `camera_id` = %s WHERE `group_id` = %s and `camera_id` = %s'
	update_record(sql_command, (new_camera_id, group_id, old_camera_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/CameraGroup', methods=['DELETE'])
def bk_camera_group_delete():
	group_id = request.form.get('group_id')
	camera_id = request.form.get('camera_id')
	sql_command = 'delete from `camera_group` WHERE `group_id` = %s and `camera_id` = %s'
	update_record(sql_command, (group_id, camera_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Log', methods=['PUT'])
def bk_log_edit():
	field = request.form.get('field')
	value = request.form.get('value')
	if field == 'clear': value = 0 if value == 'false' else 1
	log_id = request.form.get('log_id')
	sql_command = 'update `gate_transactions` set `{}` = %s WHERE `id` = %s'.format(field)
	update_record(sql_command, (value, log_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Permission', methods=['DELETE'])
def bk_permission_delete():
	id = request.form.get('id')
	sql_command = 'delete from `agent_permissions` WHERE `id` = %s'
	update_record(sql_command, id)
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Permission', methods=['POST'])
def bk_permission_add():
	user_id = request.form.get('agent_id')
	group_id = request.form.get('gate_id')
	sql_command = 'select `id` from `agent_permissions` where `agent_id` = %s and `gate_id` = %s'
	num, _ = get_one_record(sql_command, (user_id, group_id))
	if num < 1:
		sql_command = 'insert into `agent_permissions` (`agent_id`, `gate_id`) values (%s, %s)'
		update_record(sql_command, (user_id, group_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Group_Camera', methods=['DELETE'])
def bk_Group_Camera_delete():
	id = request.form.get('id')
	sql_command = 'delete from `gate_camera` WHERE `id` = %s'
	update_record(sql_command, id)
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Group_Camera', methods=['POST'])
def bk_Group_Camera_add():
	camera_id = request.form.get('camera_id')
	gate_id = request.form.get('gate_id')
	sql_command = 'select `id` from `gate_camera` where `camera_id` = %s and `gate_id` = %s'
	num, _ = get_one_record(sql_command, (camera_id, gate_id))
	if num < 1:
		sql_command = 'insert into `gate_camera` (`camera_id`, `gate_id`) values (%s, %s)'
		update_record(sql_command, (camera_id, gate_id))
	return json.dumps(success_200_message('ok'))

def check_user_name_exists(user_name, user_id=None):
	if user_id is None:
		sql_command = 'select `id` from `agent` where `name` = %s'
		params = user_name
	else:
		sql_command = 'select `id` from `agent` where `name` = %s and not `id` = %s'
		params = (user_name, user_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

@app.route('/bk/User', methods=['POST'])
def bk_user_add():
	user_name = request.form.get('name')
	email = request.form.get('email')
	if check_user_name_exists(user_name): return json.dumps(error_400_message('user_name'))
	sql_command = 'insert into `agent` (`name`, `email`, `register_date`) values (%s, %s, %s)'
	update_record(sql_command, (user_name, email, datetime.datetime.now().strftime("%Y-%m-%d %H:%M")))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/User', methods=['PUT'])
def bk_user_edit():
	user_name = request.form.get('name')
	email = request.form.get('email')
	user_id = request.form.get('id')
	if check_user_name_exists(user_name, user_id): return json.dumps(error_400_message('user_name'))
	sql_command = 'update `agent` set `name` = %s, `email` = %s WHERE `id` = %s'
	update_record(sql_command, (user_name, email, user_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/User', methods=['DELETE'])
def bk_user_delete():
	user_id = request.form.get('id')
	sql_command = 'delete from `agent` WHERE `id` = %s'
	update_record(sql_command, user_id)
	sql_command = 'delete from `agent_permissions` WHERE `agent_id` = %s'
	update_record(sql_command, user_id)
	return json.dumps(success_200_message('ok'))

def check_driver_number_exists(driver_number, driver_id=None):
	if driver_id is None:
		sql_command = 'select `id` from `drivers` where `driver_number` = %s'
		params = driver_number
	else:
		sql_command = 'select `id` from `drivers` where `driver_number` = %s and not `id` = %s'
		params = (driver_number, driver_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

def check_DOB_format(driver_DOB):
	try:
		GMT_FORMAT = '%a, %d %b %Y %H:%M:%S GMT'
		date_time = datetime.datetime.strptime(driver_DOB, GMT_FORMAT)
	except:
		date_time = datetime.datetime.strptime(driver_DOB, '%Y/%m/%d %H:%M:%S')
	date_time_str = date_time.strftime("%Y-%m-%d")
	return date_time_str

@app.route('/bk/Driver', methods=['POST'])
def bk_driver_add():
	driver_first_name = request.form.get('driver_first_name')
	driver_last_name = request.form.get('driver_last_name')
	driver_number = request.form.get('driver_number')
	driver_province = request.form.get('driver_province')
	driver_DOB = request.form.get('driver_DOB')
	driver_sex = 0 if request.form.get('driver_sex') == 'male' else 0
	driver_face_data = request.form.get('driver_face_data')
	if check_driver_number_exists(driver_number): return json.dumps(error_400_message('driver_number'))
	driver_DOB = check_DOB_format(driver_DOB)
	#if issue: return json.dumps(error_400_message('driver_DOB'))

	sql_command = 'insert into `drivers` (`first_name`, `last_name`, `expiry_date`, `driver_number`, `province`, `DOB`, `sex`) values (%s, %s, %s, %s, %s, %s, %s)'
	update_record(sql_command, (driver_first_name, driver_last_name, datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), driver_number, driver_province, driver_DOB, driver_sex))

	sql_command = 'select `id` from `drivers` where `driver_number` = %s'
	num, record = get_one_record(sql_command, driver_number)
	driver_id = record[0]

	face_path = 'static/images/users/user{}.jpg'.format(driver_id)
	encoded_data = driver_face_data.split(',')[-1]
	image_buf = base64.b64decode(encoded_data)
	with open(face_path, 'wb') as f:
		f.write(image_buf)

	sql_command = 'update `drivers` set `face_path` = %s WHERE `id` = %s'
	update_record(sql_command, (face_path, driver_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Driver', methods=['PUT'])
def bk_driver_edit():
	driver_first_name = request.form.get('first_name')
	driver_last_name = request.form.get('last_name')
	driver_number = request.form.get('driver_number')
	driver_province = request.form.get('province')
	driver_DOB = request.form.get('DOB')
	driver_sex = request.form.get('sex')
	driver_id = request.form.get('id')
	if check_driver_number_exists(driver_number, driver_id): return json.dumps(error_400_message('driver_number'))
	driver_DOB = check_DOB_format(driver_DOB)
	#if issue: return json.dumps(error_400_message('driver_DOB'))

	if False: #driver_face_url == "":
		face_path = 'static/images/users/user{}.jpg'.format(driver_id)
		encoded_data = driver_face_data.split(',')[-1]
		image_buf = base64.b64decode(encoded_data)
		with open(face_path, 'wb') as f:
			f.write(image_buf)
	sql_command = 'update `drivers` set `first_name` = %s, `last_name` = %s, `driver_number` = %s, `province` = %s, `DOB` = %s, `sex` = %s WHERE `id` = %s'
	update_record(sql_command, (driver_first_name, driver_last_name, driver_number, driver_province, driver_DOB, driver_sex, driver_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Driver', methods=['DELETE'])
def bk_driver_delete():
	driver_id = request.form.get('id')
	sql_command = 'delete from `drivers` WHERE `id` = %s'
	update_record(sql_command, driver_id)
	face_path = 'static/images/users/user{}.jpg'.format(driver_id)
	try:
		os.remove(face_path)
	except:
		pass
	return json.dumps(success_200_message('ok'))

def check_customer_name_exists(customer_name, customer_id=None):
	if customer_id is None:
		sql_command = 'select `company_id` from `companys` where `company_name` = %s'
		params = customer_name
	else:
		sql_command = 'select `company_id` from `companys` where `company_name` = %s and not `company_id` = %s'
		params = (customer_name, customer_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

@app.route('/bk/Customer', methods=['POST'])
def bk_customer_add():
	customer_name = request.form.get('name')
	customer_address = request.form.get('address')
	customer_contacts = request.form.get('contacts')
	customer_email = request.form.get('email')
	if check_customer_name_exists(customer_name): return json.dumps(error_400_message('customer_name'))
	sql_command = 'insert into `companys` (`company_name`, `company_address`, `company_contacts`, `company_email`) values (%s, %s, %s, %s)'
	update_record(sql_command, (customer_name, customer_address, customer_contacts, customer_email))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Customer', methods=['PUT'])
def bk_customer_edit():
	customer_name = request.form.get('name')
	customer_address = request.form.get('address')
	customer_contacts = request.form.get('contacts')
	customer_email = request.form.get('email')
	customer_id = request.form.get('id')
	if check_customer_name_exists(customer_name, customer_id): return json.dumps(error_400_message('customer_name'))
	sql_command = 'update `companys` set `company_name` = %s, `company_address` = %s, `company_contacts` = %s, `company_email` = %s WHERE `company_id` = %s'
	update_record(sql_command, (customer_name, customer_address, customer_contacts, customer_email, customer_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Customer', methods=['DELETE'])
def bk_customer_delete():
	customer_id = request.form.get('id')
	sql_command = 'delete from `companys` WHERE `company_id` = %s'
	update_record(sql_command, customer_id)
	return json.dumps(success_200_message('ok'))

def check_white_list_exists(white_list_value, white_list_type):
	sql_command = 'select `id` from `whitelist` where `value` = %s and `type` = %s'
	params = (white_list_value, white_list_type)
	num, _ = get_one_record(sql_command, params)
	return num > 0

@app.route('/bk/WhiteList', methods=['POST'])
def bk_white_list_add():
	value = request.form.get('value')
	type = request.form.get('type')
	isBlack = request.form.get('isBlack')
	loc_id = request.form.get('loc_id')
	effective_date = check_DOB_format(request.form.get('effective_date'))
	approve_date = check_DOB_format(request.form.get('approve_date'))
	approved_by = request.form.get('approved_by')
	sql_command = 'insert into `blacklist` (`value`, `type`, `isBlack`, `loc_id`, `effective_date`, `approve_date`, `approved_by`) values (%s, %s, %s, %s, %s, %s, %s)'
	update_record(sql_command, (value, type, isBlack, loc_id, effective_date, approve_date, approved_by))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/WhiteList', methods=['PUT'])
def bk_white_list_edit():
	value = request.form.get('value')
	type = request.form.get('type')
	isBlack = request.form.get('isBlack')
	loc_id = request.form.get('loc_id')
	effective_date = check_DOB_format(request.form.get('effective_date'))
	approve_date = check_DOB_format(request.form.get('approve_date'))
	approved_by = request.form.get('approved_by')
	id = request.form.get('id')
	sql_command = 'update `blacklist` set `value` = %s, `type` = %s, `isBlack` = %s, `loc_id` = %s, `effective_date` = %s, `approve_date` = %s, `approved_by` = %s WHERE `id` = %s'
	update_record(sql_command, (value, type, isBlack, loc_id, effective_date, approve_date, approved_by, id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/WhiteList', methods=['DELETE'])
def bk_white_list_delete():
	white_list_id = request.form.get('id')
	sql_command = 'delete from `blacklist` WHERE `id` = %s'
	update_record(sql_command, white_list_id)
	return json.dumps(success_200_message('ok'))

@app.route('/bk/BlackList', methods=['POST'])
def bk_black_list_add():
	white_list_value = request.form.get('value')
	white_list_type = request.form.get('type')
	if check_white_list_exists(white_list_value, white_list_type): return json.dumps(error_400_message('content'))
	sql_command = 'insert into `blacklist` (`value`, `type`) values (%s, %s)'
	update_record(sql_command, (white_list_value, white_list_type))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/BlackList', methods=['PUT'])
def bk_black_list_edit():
	white_list_value = request.form.get('value')
	white_list_type = request.form.get('type')
	white_list_id = request.form.get('id')
	if check_white_list_exists(white_list_value, white_list_type): return json.dumps(error_400_message('content'))
	sql_command = 'update `blacklist` set `value` = %s, `type` = %s WHERE `id` = %s'
	update_record(sql_command, (white_list_value, white_list_type, white_list_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/BlackList', methods=['DELETE'])
def bk_black_list_delete():
	white_list_id = request.form.get('id')
	sql_command = 'delete from `blacklist` WHERE `id` = %s'
	update_record(sql_command, white_list_id)
	return json.dumps(success_200_message('ok'))

def check_camera_name_exists(camera_name, camera_id=None):
	if camera_id is None:
		sql_command = 'select `id` from `cameras` where `name` = %s'
		params = camera_name
	else:
		sql_command = 'select `id` from `cameras` where `name` = %s and not `id` = %s'
		params = (camera_name, camera_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

def check_camera_url_exists(camera_url, camera_id=None):
	if camera_id is None:
		sql_command = 'select `id` from `cameras` where `url` = %s'
		params = camera_url
	else:
		sql_command = 'select `id` from `cameras` where `url` = %s and not `id` = %s'
		params = (camera_url, camera_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

@app.route('/bk/Camera', methods=['POST'])
def bk_camera_add():
	camera_name = request.form.get('name')
	camera_url = request.form.get('url')
	if check_camera_name_exists(camera_name): return json.dumps(error_400_message('camera_name'))
	if check_camera_url_exists(camera_url): return json.dumps(error_400_message('camera_url'))
	sql_command = 'insert into `cameras` (`name`, `url`) values (%s, %s)'
	update_record(sql_command, (camera_name, camera_url))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Camera', methods=['PUT'])
def bk_camera_edit():
	camera_name = request.form.get('name')
	camera_url = request.form.get('url')
	camera_id = request.form.get('id')
	if check_camera_name_exists(camera_name, camera_id): return json.dumps(error_400_message('camera_name'))
	if check_camera_url_exists(camera_url, camera_id): return json.dumps(error_400_message('camera_url'))
	sql_command = 'update `cameras` set `name` = %s, `url` = %s WHERE `id` = %s'
	update_record(sql_command, (camera_name, camera_url, camera_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Camera', methods=['DELETE'])
def bk_camera_delete():
	camera_id = request.form.get('id')
	sql_command = 'delete from `cameras` WHERE `id` = %s'
	update_record(sql_command, camera_id)
	return json.dumps(success_200_message('ok'))

def check_loc_name_exists(loc_name, company_id, loc_id=None):
	if loc_id is None:
		sql_command = 'select `loc_id` from `location_sites` where `loc_name` = %s and `company_id` = %s'
		params = (loc_name, company_id)
	else:
		sql_command = 'select `loc_id` from `location_sites` where `loc_name` = %s and `company_id` = %s and not `loc_id` = %s'
		params = (loc_name, company_id, loc_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

def check_loc_ip_exists(loc_ip, company_id, loc_id=None):
	if loc_id is None:
		sql_command = 'select `loc_id` from `location_sites` where `loc_ip` = %s and `company_id` = %s'
		params = (loc_ip, company_id)
	else:
		sql_command = 'select `loc_id` from `location_sites` where `loc_ip` = %s and `company_id` = %s and not `loc_id` = %s'
		params = (loc_ip, company_id, loc_id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

@app.route('/bk/Location_Site', methods=['POST'])
def bk_loc_add():
	loc_name = request.form.get('loc_name')
	loc_address = request.form.get('loc_address')
	loc_ip = request.form.get('loc_ip')
	company_id = request.form.get('company_id')
	if check_loc_name_exists(loc_name, company_id): return json.dumps(error_400_message('loc_name'))
	if check_loc_ip_exists(loc_ip, company_id): return json.dumps(error_400_message('loc_ip'))
	sql_command = 'insert into `location_sites` (`loc_name`, `loc_address`, `loc_ip`, `company_id`) values (%s, %s, %s, %s)'
	update_record(sql_command, (loc_name, loc_address, loc_ip, company_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Location_Site', methods=['PUT'])
def bk_loc_edit():
	loc_name = request.form.get('loc_name')
	loc_address = request.form.get('loc_address')
	loc_ip = request.form.get('loc_ip')
	company_id = request.form.get('company_id')
	loc_id = request.form.get('loc_id')
	if check_loc_name_exists(loc_name, company_id, loc_id): return json.dumps(error_400_message('loc_name'))
	if check_loc_ip_exists(loc_ip, company_id, loc_id): return json.dumps(error_400_message('loc_ip'))
	sql_command = 'update `location_sites` set `loc_name` = %s, `loc_address` = %s, `loc_ip` = %s, `company_id` = %s WHERE `loc_id` = %s'
	update_record(sql_command, (loc_name, loc_address, loc_ip, company_id, loc_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Location_Site', methods=['DELETE'])
def bk_loc_delete():
	loc_id = request.form.get('loc_id')
	sql_command = 'delete from `location_sites` WHERE `loc_id` = %s'
	update_record(sql_command, loc_id)
	return json.dumps(success_200_message('ok'))

def check_gate_name_exists(name, loc_id, id=None):
	if id is None:
		sql_command = 'select `id` from `gates` where `name` = %s and `loc_id` = %s'
		params = (name, loc_id)
	else:
		sql_command = 'select `id` from `gates` where `name` = %s and `loc_id` = %s and not `id` = %s'
		params = (name, loc_id, id)
	num, _ = get_one_record(sql_command, params)
	return num > 0

@app.route('/bk/Gates', methods=['POST'])
def bk_gate_add():
	name = request.form.get('name')
	details = request.form.get('details')
	loc_id = request.form.get('loc_id')
	if check_gate_name_exists(name, loc_id): return json.dumps(error_400_message('name'))
	sql_command = 'insert into `gates` (`name`, `details`, `loc_id`) values (%s, %s, %s)'
	update_record(sql_command, (name, details, loc_id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Gates', methods=['PUT'])
def bk_gate_edit():
	name = request.form.get('name')
	details = request.form.get('details')
	loc_id = request.form.get('loc_id')
	id = request.form.get('id')
	if check_gate_name_exists(name, loc_id, id): return json.dumps(error_400_message('name'))
	sql_command = 'update `gates` set `name` = %s, `details` = %s, `loc_id` = %s WHERE `id` = %s'
	update_record(sql_command, (name, details, loc_id, id))
	return json.dumps(success_200_message('ok'))

@app.route('/bk/Gates', methods=['DELETE'])
def bk_gate_delete():
	id = request.form.get('id')
	sql_command = 'delete from `gates` WHERE `id` = %s'
	update_record(sql_command, id)
	return json.dumps(success_200_message('ok'))


############################   menu   ############################
usual_menu_items = ['Gate_Transactions', 'Driver', 'Camera', 'Group_Camera', 'Gates']
usual_menu_texts = ['Gate Trans', 'Driver', 'Camera', 'Group-Camera', 'Gates']
admin_menu_items = ['Agent', 'Permission', 'Company', 'Black_White_List', 'Location_Site']
admin_menu_texts = ['Agent', 'Permission', 'Company', 'B/W List', 'Loc/Site']
@app.route('/bk/Menu', methods=['GET'])
def get_menu_item():
	if session.get('admin') is None:
		return json.dumps(error_403_message('not login'))
	menu_items = usual_menu_items + (admin_menu_items if session['admin'] else [])
	menu_texts = usual_menu_texts + (admin_menu_texts if session['admin'] else [])
	menu_dict = []
	for menu_item, menu_text in zip(menu_items, menu_texts):
		menu_dict.append({
			'id': menu_item,
			'text': menu_text,
			'link': "/" + menu_item
		})
	return json.dumps({'statusCode': 200, 'menu_items': menu_dict})

from sql import get_full_data
@app.route('/bk/Driver', methods=['GET'])
def bk_Driver():
	sql_command = 'select * from `drivers`'
	return json.dumps(get_full_data(sql_command))

from sql import get_Logs
@app.route('/bk/Log', methods=['GET'])
def bk_Log():
	return json.dumps(get_Logs())

from sql import get_one_data

@app.route('/bk/DriverOne', methods=['POST'])
def bk_driver_getOne():
	id = request.form.get('id')
	sql_command = 'select * from `drivers` where `id` = %s'
	params = id
	num, record = get_one_record(sql_command, params)
	result_dict = record if num < 1 else error_400_message('can not find')
	return json.dumps(result_dict)

from sql import get_Group
@app.route('/bk/Group', methods=['GET'])
def bk_Group():
	return json.dumps(get_Group())

@app.route('/bk/User', methods=['GET'])
def bk_User():
	sql_command = 'select `id`, `name`, `email`, `register_date` from `agent` where `admin` = 0'
	return json.dumps(get_full_data(sql_command))

@app.route('/bk/Customer', methods=['GET'])
def bk_Customer():
	sql_command = 'select `company_id`, `company_name`, `company_address`, `company_contacts`, `company_email` from `companys`'
	return json.dumps(get_full_data(sql_command, ['id', 'name', 'address', 'contacts', 'email']))

from sql import get_BlackWhiteList
@app.route('/bk/WhiteList', methods=['GET'])
def bk_WhiteList():
	return json.dumps(get_BlackWhiteList())

@app.route('/bk/BlackList', methods=['GET'])
def bk_BlackList():
	sql_command = 'select `id`, `value`, `type` from `blacklist`'
	return json.dumps(get_full_data(sql_command))

from sql import get_Permission
@app.route('/bk/Permission', methods=['GET'])
def bk_Permission():
	return json.dumps(get_Permission())

from sql import get_Group_Camera
@app.route('/bk/Group_Camera', methods=['GET'])
def bk_Group_Camera():
	return json.dumps(get_Group_Camera())

from sql import get_Location_Site
@app.route('/bk/Location_Site', methods=['GET'])
def bk_Location_Site():
	return json.dumps(get_Location_Site())

from sql import get_Gates
@app.route('/bk/Gates', methods=['GET'])
def bk_Gates():
	return json.dumps(get_Gates())

@app.route('/bk/Camera', methods=['GET'])
def bk_Camera():
	sql_command = 'select `id`, `name`, `url` from `cameras`'
	return json.dumps(get_full_data(sql_command))


############################   web pages   ############################
@app.route('/')
def main_register():
	return render_template('index.html')

def load_page(param):
	if param in usual_menu_items: return render_template('{}.html'.format(param))
	if session.get('admin') is False: return render_template('empty.html')
	return render_template('{}.html'.format(param))

@app.route('/Gate_Transactions')
def fr_Log():
	return load_page('Gate_Transactions')

@app.route('/Driver')
def fr_Driver():
	return load_page('Driver')

@app.route('/Gates')
def fr_Group():
	return load_page('Gates')

@app.route('/Agent')
def fr_User():
	return load_page('Agent')

@app.route('/Permission')
def fr_Permission():
	return load_page('Permission')

@app.route('/Company')
def fr_Customers():
	return load_page('Company')

@app.route('/Black_White_List')
def fr_WhiteList():
	return load_page('Black_White_List')

@app.route('/Location_Site')
def fr_LocationSite():
	return load_page('Location_Site')

@app.route('/Camera')
def fr_Camera():
	return load_page('Camera')

@app.route('/Group_Camera')
def fr_Group_Camera():
	return load_page('Group_Camera')


############################   Camera checking   ############################
class VideoCamera():
	def __init__(self, url):
		self.video = cv2.VideoCapture(url)

	def __del__(self):
		self.video.release()

	def get_frame(self):
		success, image = self.video.read()
		ret, jpeg = cv2.imencode('.jpg', image)
		return jpeg.tobytes()

def gen(camera):
	while True:
		try:
			frame = camera.get_frame()
		except:
			ret, jpeg = cv2.imencode('.jpg', cv2.imread('static/images/no connected.jpg'))
			frame = jpeg.tobytes()
		yield (b'--frame\r\n'
			   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed1')
def fr_video_feed1():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed2')
def fr_video_feed2():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed3')
def fr_video_feed3():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed4')
def fr_video_feed4():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  

@app.route('/video_feed5')
def fr_video_feed5():
	url = request.args.get('url')
	return Response(gen(VideoCamera(url)), mimetype='multipart/x-mixed-replace; boundary=frame')  


if __name__ == "__main__":
	app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
