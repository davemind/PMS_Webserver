from responses import error_400_message, error_401_message, error_403_message, success_200_message

def get_password(password):
    return password

def check_password(db_password, login_password):
    return db_password == login_password

from sql import get_one_record
def log_in(user_name, password):
	sql_command = 'select `password`, `role_id`, `id`  from `tbl_admin` where `email` = %s'
	num, info = get_one_record(sql_command, user_name)
	if num < 1: return error_400_message("user name")
	if not check_password(info[0], password):
		return error_400_message('password')
	return {
		"status": 'SUCCESS',
		"statusCode": '200',
		"message": 'admin' if info[1] == 1 else 'non-admin',
		"id": info[2],
	}

from sql import add_administrator
def add_admin():
	add_administrator(get_password('admin123456'))