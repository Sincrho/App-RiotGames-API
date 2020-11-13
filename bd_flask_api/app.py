from flask import Flask
from flasgger import Swagger
from api.route import views

app = Flask(__name__)

app.add_url_rule('/', view_func=views.index,methods=['GET'])
#Routes para jugadores
app.add_url_rule('/add_jugador', view_func=views.add_jugador, methods=['POST'])
app.add_url_rule('/get_jugadores', view_func=views.get_jugadores, methods=['GET'])
app.add_url_rule('/get_jugador/<id_jugador>', view_func=views.get_jugador, methods=['GET'])
#Routes para equipos
app.add_url_rule('/add_equipo', view_func=views.add_equipo, methods=['POST'])
app.add_url_rule('/get_equipos', view_func=views.get_equipos, methods=['GET'])
app.add_url_rule('/get_equipo/<id_equipo>', view_func=views.get_equipo, methods=['GET'])
#Routes para servidores
app.add_url_rule('/add_servidor', view_func=views.add_servidor, methods=['POST'])
app.add_url_rule('/get_servidores', view_func=views.get_servidores, methods=['GET'])
app.add_url_rule('/get_servidor/<id_servidor>', view_func=views.get_servidor, methods=['GET'])
#Routes para torneos
app.add_url_rule('/add_torneo', view_func=views.add_torneo, methods=['POST'])
app.add_url_rule('/get_torneos', view_func=views.get_torneos, methods=['GET'])
app.add_url_rule('/get_torneo/<id_torneo>', view_func=views.get_torneo, methods=['GET'])
#Routes para partidas
app.add_url_rule('/add_partida', view_func=views.add_partida, methods=['POST'])
app.add_url_rule('/get_partidas', view_func=views.get_partidas, methods=['GET'])
app.add_url_rule('/get_partida/<id_partida>', view_func=views.get_partida, methods=['GET'])


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=5000, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port
    app.run(host='0.0.0.0', port=port)

