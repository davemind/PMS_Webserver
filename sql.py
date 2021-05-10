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

def get_Logs():
	db, cur = get_db_cursor()
	sql_command = 'select * from `gate_transactions`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	json_data = []
	for result in rv:
		result = list(result)
		sql_command = 'select `driver_number` from `drivers` where `id` = %s'
		num = cur.execute(sql_command, result[14])
		result[14] = cur.fetchone()[0] if num > 0 else "unknown"
		sql_command = 'select `name` from `agent` where `id` = %s'
		num = cur.execute(sql_command, result[-2])
		result[-2] = cur.fetchone()[0] if num > 0 else "unknown"
		sql_command = 'select `name` from `gates` where `id` = %s'
		num = cur.execute(sql_command, result[-1])
		result[-1] = cur.fetchone()[0] if num > 0 else "unknown"
		json_data.append(dict(zip(row_headers, result)))
	cur.close()
	db.close()
	return json_data

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

def get_Group():
	db, cur = get_db_cursor()
	sql_command = 'SELECT gates.`id`, gates.`name`, gates.`loc_id`, location_sites.`loc_name`, companys.`company_name` FROM gates LEFT JOIN location_sites ON location_sites.`loc_id` = gates.`loc_id` LEFT JOIN companys ON companys.`company_id` = location_sites.`company_id`'
	num = cur.execute(sql_command)
	headers = ['id', 'gate_id', 'gate_name', 'loc_name', 'company_name', 'loc_id', 'camera_id', "parent_id"]
	rv = cur.fetchall()
	groups_json_data, group_ids = [], {}
	Task_ID, id = 1, 1
	for gate_id, gate_name, loc_id, loc_name, company_name in rv:
		group_ids[Task_ID] = gate_id
		#groups_json_data.append(dict(zip(headers, [id, gate_id, gate_name, 0, 0])))
		id += 1
		sql_command = 'select `camera_id` from `gate_camera` where `gate_id` = %s'
		num = cur.execute(sql_command, gate_id)
		cameras = cur.fetchall()
		for camera_record in cameras:
			groups_json_data.append(dict(zip(headers, [id, gate_id, gate_name, loc_name, company_name, loc_id, camera_record[0], Task_ID])))
			id += 1
		Task_ID = id
	sql_command = 'select `id`, `name`, `url` from `cameras`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	cameras_json_data = [{'id': 0, 'name': '', 'url': ''}]
	for result in rv:
		cameras_json_data.append(dict(zip(row_headers, result)))
	cur.close()
	db.close()
	return {'gate_ids': group_ids, 'gates': groups_json_data, 'cameras': cameras_json_data}

def get_User():
	db, cur = get_db_cursor()
	sql_command = 'select `id`, `name`, `email`, `register_date` from `users` where `admin` = 0'
	num = cur.execute(sql_command)
	record = list(cur.fetchall()) if num > 0 else []
	for i in range(len(record)):
		record[i] = list(record[i])
		record[i][-1] = record[i][-1].strftime("%d/%m/%Y")
	cur.close()
	db.close()
	return record

def get_BlackWhiteList():
	types_json_data = []
	types = ['tractor', 'trailer', 'driver', 'company']
	for id, type in enumerate(types):
		types_json_data.append({'id': id, 'name': type})
	BlackWhitetypes_json_data = []
	types = ['White List', 'Black List']
	for id, type in enumerate(types):
		BlackWhitetypes_json_data.append({'id': id, 'name': type})
	db, cur = get_db_cursor()
	sql_command = 'select `loc_id`, `loc_name` from `location_sites`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	Locations_json_data = []
	for result in rv:
		Locations_json_data.append(dict(zip(row_headers, result)))
	sql_command = 'select `id`, `name` from `agent` where `admin` = 0'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	agents_json_data = []
	for result in rv:
		agents_json_data.append(dict(zip(row_headers, result)))
	sql_command = 'select * from `blacklist`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	blacklist_json_data = []
	for result in rv:
		blacklist_json_data.append(dict(zip(row_headers, result)))

	cur.close()
	db.close()
	return {'type': types_json_data, 'BlackWhitetypes': BlackWhitetypes_json_data, 'Locations': Locations_json_data, 'agents': agents_json_data, 'blacklist_json_data': blacklist_json_data}

def get_Permission():
	db, cur = get_db_cursor()
	sql_command = 'select `id`, `name` from `agent` where `admin` = 0'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	users_json_data = []
	for result in rv:
		users_json_data.append(dict(zip(row_headers, result)))

	sql_command = 'select `id`, `name` from `gates`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	groups_json_data = []
	for result in rv:
		groups_json_data.append(dict(zip(row_headers, result)))

	sql_command = 'select `id`, `agent_id`, `gate_id` from `agent_permissions`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	user_permissions_json_data = []
	for result in rv:
		user_permissions_json_data.append(dict(zip(row_headers, result)))

	cur.close()
	db.close()
	return {'users': users_json_data, 'groups': groups_json_data, 'user_permissions': user_permissions_json_data}

def get_Group_Camera():
	db, cur = get_db_cursor()
	sql_command = 'select `id`, `name` from `cameras`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	cameras_json_data = []
	for result in rv:
		cameras_json_data.append(dict(zip(row_headers, result)))

	sql_command = 'select `id`, `name` from `gates`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	gates_json_data = []
	for result in rv:
		gates_json_data.append(dict(zip(row_headers, result)))

	sql_command = 'select * from `gate_camera`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	gate_camera_json_data = []
	for result in rv:
		gate_camera_json_data.append(dict(zip(row_headers, result)))

	cur.close()
	db.close()
	return {'cameras': cameras_json_data, 'gates': gates_json_data, 'gate_camera': gate_camera_json_data}

def get_Location_Site():
	db, cur = get_db_cursor()
	sql_command = 'select `company_id`, `company_name` from `companys`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	companys_json_data = []
	for result in rv:
		companys_json_data.append(dict(zip(row_headers, result)))

	sql_command = 'select * from `location_sites`'
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	location_sites_json_data = []
	for result in rv:
		location_sites_json_data.append(dict(zip(row_headers, result)))

	cur.close()
	db.close()
	return {'companys': companys_json_data, 'location_sites': location_sites_json_data}

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

def get_Customer():
	db, cur = get_db_cursor()
	sql_command = 'select `id`, `name`, `address`, `contacts`, `email` from `customers`'
	num = cur.execute(sql_command)
	record = list(cur.fetchall()) if num > 0 else []
	cur.close()
	db.close()
	return record

def get_WhiteList_BlackList(sql_command):
	db, cur = get_db_cursor()
	num = cur.execute(sql_command)
	row_headers = [x[0] for x in cur.description]  # this will extract row headers
	rv = cur.fetchall()
	json_data = []
	for result in rv:
		result = list(result)
		result[-1] = 'tractor' if result[-1] == 0 else 'driver' if result[-1] == 1 else 'company'
		json_data.append(dict(zip(row_headers, result)))
	cur.close()
	db.close()
	return json_data

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
