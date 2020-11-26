from flask import Flask, render_template, url_for, request, jsonify
from flasgger import Swagger
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow 


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bd_api_RiotGames.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#Inicio base de datos
db = SQLAlchemy(app)

# Init marshmallow
ma = Marshmallow(app)

#Inicio marshmallow
class Jugadores(db.Model):
    id_jugador = db.Column(db.Integer, primary_key=True)
    id_servidor = db.Column(db.String(10), nullable=False)
    nombre_jugador = db.Column(db.String(50))

    def __init__(self, id_jugador, id_servidor, nombre_jugador):
        self.id_jugador = id_jugador
        self.id_servidor = id_servidor
        self.nombre_jugador = nombre_jugador


# Agregar un jugador
@app.route('/add_jugador', methods=['POST'])
def add_jugador():
  id_jugador = request.json['id_jugador']
  id_servidor = request.json['id_servidor']
  nombre_jugador = request.json['nombre_jugador']

  new_jugador = Jugadores(id_jugador, id_servidor, nombre_jugador)

  db.session.add(new_jugador)
  db.session.commit()

  return jugador_schema.jsonify(new_jugador)

# Obtener todos los jugadores
@app.route('/get_jugadores', methods=['GET'])
def get_jugadores():
  all_jugadores = Jugadores.query.all()
  result = jugadores_schema.dump(all_jugadores)
  return jsonify(result)

# Obtener un jugador en especifico
@app.route('/get_jugador/<id_jugador>', methods=['GET'])
def get_jugador(id_jugador):
  jugador = Jugadores.query.get(id_jugador)
  return jugador_schema.jsonify(jugador)


class Equipos(db.Model):
    id_equipo = db.Column(db.Integer, primary_key=True)
    nombre_equipo = db.Column(db.String(50))

    def __init__(self, id_equipo, nombre_equipo):
        self.id_equipo = id_equipo
        self.nombre_equipo = nombre_equipo

# Agregar un equipo
@app.route('/add_equipo', methods=['POST'])
def add_equipo():
  id_equipo = request.json['id_equipo']
  nombre_equipo = request.json['nombre_equipo']

  new_equipo = Equipos(id_equipo, nombre_equipo)

  db.session.add(new_equipo)
  db.session.commit()

  return equipo_schema.jsonify(new_equipo)

# Obtener todos los equipos
@app.route('/get_equipos', methods=['GET'])
def get_equipos():
  all_equipos = Equipos.query.all()
  result = equipos_schema.dump(all_equipos)
  return jsonify(result)

# Obtener un equipo en especifico
@app.route('/get_equipo/<id_equipo>', methods=['GET'])
def get_equipo(id_equipo):
  equipo = Equipos.query.get(id_equipo)
  return equipo_schema.jsonify(equipo)


class Servidores(db.Model):
    id_servidor = db.Column(db.Integer, primary_key=True)
    region_servidor = db.Column(db.String(40))

    def __init__(self, id_servidor, region_servidor):
        self.id_servidor = id_servidor
        self.region_servidor = region_servidor

@app.route('/add_servidor', methods=['POST'])
def add_servidor():
  id_servidor = request.json['id_servidor']
  region_servidor = request.json['region_servidor']

  new_servidor = Servidores(id_servidor, region_servidor)

  db.session.add(new_servidor)
  db.session.commit()

  return servidor_schema.jsonify(new_servidor)

@app.route('/get_servidores', methods=['GET'])
def get_servidores():
  all_servidores = Servidores.query.all()
  result = servidores_schema.dump(all_servidores)
  return jsonify(result)



@app.route('/get_servidor/<id_servidor>', methods=['GET'])
def get_servidor(id_servidor):
  servidor = Servidores.query.get(id_servidor)
  return servidor_schema.jsonify(servidor)

#TORNEOS
class Torneos(db.Model):
    id_torneo = db.Column(db.Integer, primary_key=True)
    nombre_torneo = db.Column(db.String(100), nullable=False)

    def __init__(self, id_torneo, nombre_torneo):
        self.id_torneo = id_torneo
        self.nombre_torneo = nombre_torneo


# Create a Torneo
@app.route('/add_torneo', methods=['POST'])
def add_torneo():
  id_torneo = request.json['id_torneo']
  nombre_torneo = request.json['nombre_torneo']

  new_torneo = Torneos(id_torneo, nombre_torneo)

  db.session.add(new_torneo)
  db.session.commit()

  return torneo_schema.jsonify(new_torneo)


# Get All Torneos
@app.route('/get_torneos', methods=['GET'])
def get_torneos():
  all_torneos = Torneos.query.all()
  result = torneos_schema.dump(all_torneos)
  return jsonify(result)


# Get Single Torneo
@app.route('/get_torneo/<id_torneo>', methods=['GET'])
def get_torneo(id_torneo):
  torneo = Torneos.query.get(id_torneo)
  return torneo_schema.jsonify(torneo)

@app.route('/get_torneo/<id_t>', methods=['GET'])
def get_torneo(id_torneo):
  torneo = Torneos.query.get(id_torneo)
  return torneo_schema.jsonify(torneo)



@app.route('/get_equis_tornes', methods=['GET'])
def get_equis_tornes():
   all_equis_tornes = Equi_torne.query.all()
   result = equi_torneos_schema.dump(all_equis_tornes)
   return jsonify(result)




@app.route('/get_equis_torne/<id_torneo>', methods=['GET']) #obtener todos los jugadores de un equipo
def get_equis_torne(id_torneo):
  equi_torne = Equi_torne.query.get(id_torneo)
  return jsonify (equi_torneos_schema.dump(equi_torne))



@app.route('/add_equi_torne', methods=['POST'])
def add_equi_torne():
  id_equipo = request.json['id_equipo']
  id_torneo = request.json['id_torneo']

  new_equi_torne = Equi_torne(id_equipo, id_torneo)

  db_session.add(new_equi_torne)
  db_session.commit()
  return jsonify(equi_torne_schema.dump(new_equi_torne))
  



class Partidas(db.Model):
    id_partida = db.Column(db.Integer, primary_key=True)
    resultado_partida = db.Column(db.String(50), nullable=False)

    def __init__(self, id_partida, resultado_partida):
        self.id_partida = id_partida
        self.resultado_partida = resultado_partida

# Create a Partida
@app.route('/add_partida', methods=['POST'])
def add_partida():
  id_partida = request.json['id_partida']
  resultado_partida = request.json['resultado_partida']

  new_partida = Partidas(id_partida, resultado_partida)

  db.session.add(new_partida)
  db.session.commit()

  return partida_schema.jsonify(new_partida)


# Get All Partidas
@app.route('/get_partidas', methods=['GET'])
def get_partidas():
  all_partidas = Partidas.query.all()
  result = partidas_schema.dump(all_partidas)
  return jsonify(result)


# Get Single Partida
@app.route('/get_partida/<id_partida>', methods=['GET'])
def get_partida(id_partida):
  partida = Partidas.query.get(id_partida)
  return partida_schema.jsonify(partida)


#Esquema de Jugador
class JugadorSchema(ma.Schema):
  class Meta:
    fields = ('id_jugador', 'id_servidor', 'nombre_jugador')

#Esquema de Equipo
class EquipoSchema(ma.Schema):
  class Meta:
    fields = ('id_equipo', 'nombre_equipo')

class ServidorSchema(ma.Schema):
  class Meta:
    fields = ('id_servidor', 'region_servidor')

class TorneoSchema(ma.Schema):
  class Meta:
    fields = ('id_torneo', 'nombre_torneo')

class PartidaSchema(ma.Schema):
  class Meta:
    fields = ('id_partida', 'resultado_partida')

#Iniciar esquemas
jugador_schema = JugadorSchema()
jugadores_schema = JugadorSchema(many=True)
equipo_schema = EquipoSchema()
equipos_schema = EquipoSchema(many=True)
servidor_schema = ServidorSchema()
servidores_schema = ServidorSchema(many=True)
torneo_schema = TorneoSchema()
torneos_schema = TorneoSchema(many=True)
partida_schema = PartidaSchema()
partidas_schema = PartidaSchema(many=True)


@app.route('/jugador/<id>', methods=['PUT'])
def update_jugador(id):
  jugador = Jugadores.query.get(id)

  id_servidor = request.json['id_servidor']
  nombre_jugador = request.json['nombre_jugador']

  jugador.id_servidor = id_servidor
  jugador.nombre_jugador = nombre_jugador
  db.session.commit()

  return jugador_schema.jsonify(jugador)

----------------------------------------------------
@app.route('/equipo/<id>', methods=['PUT'])
def update_equipo(id):
  equipo = Equipos.query.get(id)


  nombre_equipo = request.json['nombre_equipo']
  equipo.nombre_equipo = nombre_equipo
  db.session.commit()
  return equipo_schema.jsonify(equipo)

----------------------------------------------------

@app.route('/torneo/<id>', methods=['PUT'])
def update_torneo(id):
  torneo = Torneos.query.get(id)

  nombre_torneo = request.json['nombre_torneo']
  torneo.nombre_equipo = nombre_torneo
  db.session.commit()
  return torneo_schema.jsonify(torneo)

<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


@app.route('/partida/<id>', methods=['PUT'])
def update_partida(id):
  partida = Partidas.query.get(id)

  resultado_partida = request.json['resultado_partida']
  partida.resultado_partida = resultado_partida
  db.session.commit()
  return partida_schema.jsonify(partida)




if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=5000, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port
    app.run(host='0.0.0.0', port=port)

@app.route('/')
def index():
    return render_template('index.html')