from flask import render_template, url_for, request, jsonify
from api.model.database import db_session
from api.model.tables import *
from api.schema.schemas import *

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

#Agregar un jugador

def add_jugador():
  id_jugador = request.json['id_jugador']
  id_servidor = request.json['id_servidor']
  nombre_jugador = request.json['nombre_jugador']

  new_jugador = Jugadores(id_jugador, id_servidor, nombre_jugador)

  db_session.add(new_jugador)
  db_session.commit()

  return jsonify(jugador_schema.dumps(new_jugador))

# Obtener todos los jugadores

def get_jugadores():
  all_jugadores = Jugadores.query.all()
  result = jugadores_schema.dump(all_jugadores)
  return jsonify(result)

# Obtener un jugador en especifico

def get_jugador(id_jugador):
  jugador = Jugadores.query.get(id_jugador)
  return jsonify(jugador_schema.dumps(jugador))

# Agregar un equipo
def add_equipo():
  id_equipo = request.json['id_equipo']
  nombre_equipo = request.json['nombre_equipo']

  new_equipo = Equipos(id_equipo, nombre_equipo)

  session.add(new_equipo)
  session.commit()

  return jsonify(equipo_schema(new_equipo))

# Obtener todos los equipos
def get_equipos():
  all_equipos = Equipos.query.all()
  result = equipos_schema.dump(all_equipos)
  return jsonify(result)

# Obtener un equipo en especifico
def get_equipo(id_equipo):
  equipo = Equipos.query.get(id_equipo)
  return equipo_schema.jsonify(equipo)

#Agregar un servidor
def add_servidor():
  id_servidor = request.json['id_servidor']
  region_servidor = request.json['region_servidor']

  new_servidor = Servidores(id_servidor, region_servidor)

  db_session.add(new_servidor)
  db_session.commit()

  return servidor_schema.jsonify(new_servidor)

# Obtener todos los servidores
def get_servidores():
  all_servidores = Servidores.query.all()
  result = servidores_schema.dump(all_servidores)
  return jsonify(result)


# Obtener un servidor en especifico
def get_servidor(id_servidor):
  servidor = Servidores.query.get(id_servidor)
  return servidor_schema.jsonify(servidor)

# Agregar un torneo
def add_torneo():
  id_torneo = request.json['id_torneo']
  nombre_torneo = request.json['nombre_torneo']

  new_torneo = Torneos(id_torneo, nombre_torneo)

  db_session.add(new_torneo)
  db_session.commit()

  return torneo_schema.jsonify(new_torneo)

# Obtener todos los torneos
def get_torneos():
  all_torneos = Torneos.query.all()
  result = torneos_schema.dump(all_torneos)
  return jsonify(result)


# Obtener un torneo en especifico
def get_torneo(id_torneo):
  torneo = Torneos.query.get(id_torneo)
  return torneo_schema.jsonify(torneo)

# Agregar una partida
def add_partida():
  id_partida = request.json['id_partida']
  resultado_partida = request.json['resultado_partida']

  new_partida = Partidas(id_partida, resultado_partida)

  db_session.add(new_partida)
  db_session.commit()

  return partida_schema.jsonify(new_partida)


# Obtener todas las partidas
def get_partidas():
  all_partidas = Partidas.query.all()
  result = partidas_schema.dump(all_partidas)
  return jsonify(result)


# Obtener una partida en especifico
def get_partida(id_partida):
  partida = Partidas.query.get(id_partida)
  return partida_schema.jsonify(partida)

#Inicio
def index():
    return render_template('index.html')