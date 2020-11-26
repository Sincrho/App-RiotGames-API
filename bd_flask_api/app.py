from flask import Flask
from flasgger import Swagger
from api.route import views
from flask_cors import CORS


app = Flask(__name__)
CORS(app)



app.add_url_rule('/', view_func=views.index,methods=['GET'])

#Routes para jugadores cors = CORS(app, resources={r"*": {"origins": "*"}})
app.add_url_rule('/add_jugador', view_func=views.add_jugador, methods=['POST'])
app.add_url_rule('/get_jugadores', view_func=views.get_jugadores, methods=['GET'])
app.add_url_rule('/get_jugador/<id_jugador>', view_func=views.get_jugador, methods=['GET'])
app.add_url_rule('/update_jugador/<id_jugador>', view_func=views.update_jugador, methods=['PUT'])
app.add_url_rule('/delete_jugador/<id_jugador>', view_func=views.delete_jugador, methods=['DELETE'])

#Routes para equipos
app.add_url_rule('/add_equipo', view_func=views.add_equipo, methods=['POST'])
app.add_url_rule('/get_equipos', view_func=views.get_equipos, methods=['GET'])
app.add_url_rule('/get_equipo/<id_equipo>', view_func=views.get_equipo, methods=['GET'])
app.add_url_rule('/update_equipo/<id_equipo>', view_func=views.update_equipo, methods=['PUT'])
app.add_url_rule('/delete_equipo/<id_equipo>', view_func=views.delete_equipo, methods=['DELETE'])
#Routes para servidores
app.add_url_rule('/add_servidor', view_func=views.add_servidor, methods=['POST'])
app.add_url_rule('/get_servidores', view_func=views.get_servidores, methods=['GET'])
app.add_url_rule('/get_servidor/<id_servidor>', view_func=views.get_servidor, methods=['GET'])

#Routes para torneos
app.add_url_rule('/add_torneo', view_func=views.add_torneo, methods=['POST'])
app.add_url_rule('/get_torneos', view_func=views.get_torneos, methods=['GET'])
app.add_url_rule('/get_torneo/<id_torneo>', view_func=views.get_torneo, methods=['GET'])
app.add_url_rule('/update_torneo/<id_torneo>', view_func=views.update_torneo, methods=['PUT'])
app.add_url_rule('/delete_torneo/<id_torneo>', view_func=views.delete_torneo, methods=['DELETE'])

#Routes para partidas
app.add_url_rule('/add_partida', view_func=views.add_partida, methods=['POST'])
app.add_url_rule('/get_partidas', view_func=views.get_partidas, methods=['GET'])
app.add_url_rule('/get_partida/<id_partida>', view_func=views.get_partida, methods=['GET'])
app.add_url_rule('/update_partida/<id_partida>', view_func=views.update_partida, methods=['PUT'])
app.add_url_rule('/delete_partida/<id_partida>', view_func=views.delete_partida, methods=['DELETE'])

#Routes para equi_juga

app.add_url_rule('/add_equi_juga', view_func=views.add_equi_juga, methods=['POST'])
app.add_url_rule('/get_equis_jugas', view_func=views.get_equis_jugas, methods=['GET'])
app.add_url_rule('/get_equi_jugas/<id_equipo>', view_func=views.get_equi_jugas, methods=['GET'])
app.add_url_rule('/delete_equi_juga/<id_equipo>/<id_jugador>', view_func=views.delete_equi_juga, methods=['DELETE'])


#Routes para equi_torneo
app.add_url_rule('/add_equi_torneo', view_func=views.add_equi_torneo, methods=['POST'])
app.add_url_rule('/get_equis_torneos', view_func=views.get_equis_torneos, methods=['GET'])
app.add_url_rule('/get_equis_torneo/<id_torneo>', view_func=views.get_equis_torneo, methods=['GET'])
app.add_url_rule('/delete_equi_torneo/<id_equipo>/<id_torneo>', view_func=views.delete_equi_torneo, methods=['DELETE'])



#Routes para equi_torneo_partida

#app.add_url_rule('/delete_equi_torneo_partida/<id_equipo>/<id_torneo>/<id_partida>', view_func=views.delete_equi_torneo_partida, methods=['DELETE'])



if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=5000, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port
    app.run(host='0.0.0.0', port=port)

