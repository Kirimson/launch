from flask import Flask, render_template, request, g
import sqlite3
import json

application = Flask(__name__)

DATABASE = 'launch.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@application.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@application.route('/')
def index():
    return render_template('index.html')

@application.route('/store', methods=['POST'])
def store():
    if request.data:
        cur = get_db().cursor()
        data = request.get_json()
        # Update any metadata
        if data['type'] == 'metadata':
            for key in data['data']:
                sql = F"UPDATE metadata SET {key} = ? WHERE id = 1"
                if data['data'][key] == True:
                    data['data'][key] = 1
                if data['data'][key] == False:
                    data['data'][key] = 0
                cur.execute(sql, (data['data'][key],))
                get_db().commit()
        # Add any new folders
        elif data['type'] == 'folder':
            sql = F"INSERT INTO folders (name) VALUES(?)"
            cur.execute(sql, (data['data']['name'],))
            get_db().commit()
        # Add any new files
        elif data['type'] == 'file':
            sql = F"INSERT INTO files (filename, content) VALUES(?, ?)"
            filename = data['data']['filename']
            if data['data'].get('parentName'):
                filename = F"{data['data']['parentName']}/{filename}"
            cur.execute(sql, (filename, data['data']['content']))
            get_db().commit()
    return 'OK'

@application.route('/delete', methods=['POST'])
def delete():
    if request.data:
        cur = get_db().cursor()
        data = request.get_json()
        if data['type'] == 'folder':
            sql = F"DELETE FROM folders WHERE name = ?"
            cur.execute(sql, (data['data']['name'],))
            get_db().commit()
        # Add any new files
        elif data['type'] == 'file':
            sql = F"DELETE FROM files WHERE filename = ?"
            filename = data['data']['filename']
            if data['data'].get('parentName'):
                filename = F"{data['data']['parentName']}/{filename}"
            cur.execute(sql, (filename,))
            get_db().commit()
    return 'OK'

@application.route('/load', methods=['get'])
def load():
    next_folder_id = query_db('SELECT nextFolderId FROM metadata WHERE id = ?',(1,))
    background = query_db('SELECT background FROM metadata WHERE id = ?',(1,))
    hide_tree = query_db('SELECT hideTree FROM metadata WHERE id = ?',(1,))
    color = query_db('SELECT color FROM metadata WHERE id = ?',(1,))
    if hide_tree[0][0] == 0:
        hide_tree = False
    else:
        hide_tree = True
    default_search = query_db('SELECT defaultSearch FROM metadata WHERE id = ?',(1,))
    fzf = query_db('SELECT fzf FROM metadata WHERE id = ?',(1,))
    files_res = query_db('SELECT * FROM files')
    files = list()
    for file in files_res:
        files.append({'filename': file[0], 'content':file[1]})
    folders_res = query_db('SELECT * FROM folders')
    folders = list()
    for folder in folders_res:
        folders.append({'name': folder[0]})
    data = {
        "nextFolderId": next_folder_id[0][0],
        "background": background[0][0],
        "tree": hide_tree,
        "defaultSearch": default_search[0][0],
        "color": color[0][0],
        "fzf": fzf[0][0],
        "files": files,
        "folders": folders
    }
    return data

if __name__ == '__main__':
    application.debug = True
    application.run(host='0.0.0.0')
