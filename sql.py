import pymysql

def get_db_cursor():
	db = pymysql.connect(host='192.168.1.131', user='root', db='vms')
	cur = db.cursor()
	return db, cur

def get_one_record(sql_command, params):
	db, cur = get_db_cursor()
	num = cur.execute(sql_command, params)
	record = cur.fetchone()
	cur.close()
	db.close()
	return num, record

def get_one_data(sql_command, id):
	db, cur = get_db_cursor()
	num = cur.execute(sql_command, id)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	record = cur.fetchone()
	json_data = []
	json_data.append(dict(zip(row_headers, record)))
	cur.close()
	db.close()
	return num, json_data

def update_record(sql_command, params):
	db, cur = get_db_cursor()
	cur.execute(sql_command, params)
	db.commit()
	cur.close()
	db.close()

def get_full_data(sql_command, row_headers=None):
	db, cur = get_db_cursor()
	num = cur.execute(sql_command)
	if row_headers is None: row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	json_data = []
	for result in rv:
		json_data.append(dict(zip(row_headers, result)))
	cur.close()
	db.close()
	return json_data

def get_Gates():
	db, cur = get_db_cursor()
	sql_command = 'select `loc_id`, `loc_name` from `location_sites`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	location_sites_json_data = []
	for result in rv:
		location_sites_json_data.append(dict(zip(row_headers, result)))

	sql_command = 'select * from `gates`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	gates_json_data = []
	for result in rv:
		gates_json_data.append(dict(zip(row_headers, result)))

	cur.close()
	db.close()
	return {'location_sites': location_sites_json_data, 'gates': gates_json_data}

def add_administrator(admin_pwd):
	db, cur = get_db_cursor()
	sql_command = 'select `name` from `users` where `admin` = 1'
	num = cur.execute(sql_command)
	if num < 1:
		sql_command = 'insert into `users` (`name`, `pwd`, `admin`) values (%s, %s, %s)'
		cur.execute(sql_command, ('admin', admin_pwd, 1))
		db.commit()
	cur.close()
	db.close()
