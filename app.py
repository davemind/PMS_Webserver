from flask import Flask, render_template, request, json, session, Response
from responses import error_400_message, error_401_message, error_403_message, success_200_message
import os, cv2, datetime, base64
from datetime import timedelta

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
		session.clear()
		session['admin'] = (result_dict['message'] == 'admin')
		session['user_name'] = user_name
		#print(session)
	#print(user_name, password, result_dict)
	return json.dumps(result_dict)

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


############################   menu   ############################
usual_menu_items = ['Camera', 'Camera_View', 'Video']
usual_menu_texts = ['Camera', 'Camera_View', 'Video']
admin_menu_items = ['User']
admin_menu_texts = ['User']
@app.route('/bk/Menu', methods=['GET'])
def get_menu_item():
	if session.get('admin') is None:
		return json.dumps(error_403_message('not login'))
	menu_items = (admin_menu_items if session['admin'] else []) + usual_menu_items
	menu_texts = (admin_menu_texts if session['admin'] else []) + usual_menu_texts
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

@app.route('/User')
def fr_User():
	return load_page('Agent')

@app.route('/Camera')
def fr_Camera():
	return load_page('Camera')


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
