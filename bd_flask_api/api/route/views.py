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

equi_juga_schema = Equi_jugaSchema()
equi_jugas_schema = Equi_jugaSchema(many=True)

equi_torneo_schema = Equi_torneoSchema()
equi_torneos_schema = Equi_torneoSchema(many=True)


equi_torneo__partida_schema = Equi_torneo_partidaSchema ()
equi_torneo__partidas_schema = Equi_torneo_partidaSchema (many=True)

#FUNCIONES PARA JUGADOR
def add_jugador():
  id_jugador = request.json['id_jugador']
  id_servidor = request.json['id_servidor']
  nombre_jugador = request.json['nombre_jugador']

  new_jugador = Jugadores(id_jugador, id_servidor, nombre_jugador)

  db_session.add(new_jugador)
  db_session.commit()

  return jsonify(jugador_schema.dumps(new_jugador))

def get_jugadores():
  all_jugadores = Jugadores.query.all()
  result = jugadores_schema.dump(all_jugadores)
  return jsonify(result)

def get_jugador(id_jugador):
  jugador = Jugadores.query.get(id_jugador)
  return jsonify(jugador_schema.dumps(jugador))

def update_jugador(id_jugador):
  jugador = Jugadores.query.get(id_jugador)

  id_servidor = request.json['id_servidor']
  nombre_jugador = request.json['nombre_jugador']

  jugador.id_servidor = id_servidor
  jugador.nombre_jugador = nombre_jugador
  db_session.commit()

  return jsonify(jugador_schema.dumps(jugador))


def delete_jugador(id_jugador):
  jugador = Jugadores.query.get(id_jugador)
  db_session.delete(jugador)
  db_session.commit()

  return jsonify(jugador_schema.dumps(jugador))


#FUNCIONES PARA EQUIPO

def add_equipo():
  id_equipo = request.json['id_equipo']
  nombre_equipo = request.json['nombre_equipo']

  new_equipo = Equipos(id_equipo, nombre_equipo)

  session.add(new_equipo)
  session.commit()

  return jsonify(equipo_schema(new_equipo))

def get_equipos():
  all_equipos = Equipos.query.all()
  result = equipos_schema.dump(all_equipos)
  return jsonify(result)

def get_equipo(id_equipo):
  equipo = Equipos.query.get(id_equipo)
  return equipo_schema.jsonify(equipo)

def update_equipo(id):
  equipo = Equipos.query.get(id)


  nombre_equipo = request.json['nombre_equipo']
  equipo.nombre_equipo = nombre_equipo
  db_session.commit()
  return jsonify(equipo_schema.dumps(equipo))

def delete_equipo(id_equipo):
  equipo = Equipos.query.get(id_equipo)
  db_session.delete(equipo)
  db_session.commit()

  return jsonify(equipo_schema.dumps(equipo))

#FUNCIONES PARA SERVIDORES

def add_servidor():
  id_servidor = request.json['id_servidor']
  region_servidor = request.json['region_servidor']

  new_servidor = Servidores(id_servidor, region_servidor)

  db_session.add(new_servidor)
  db_session.commit()

  return servidor_schema.jsonify(new_servidor)

def get_servidores():
  all_servidores = Servidores.query.all()
  result = servidores_schema.dump(all_servidores)
  return jsonify(result)

def get_servidor(id_servidor):
  servidor = Servidores.query.get(id_servidor)
  return servidor_schema.jsonify(servidor)

#FUNCIONES PARA TORNEO
def add_torneo():
  id_torneo = request.json['id_torneo']
  nombre_torneo = request.json['nombre_torneo']

  new_torneo = Torneos(id_torneo, nombre_torneo)

  db_session.add(new_torneo)
  db_session.commit()

  return torneo_schema.jsonify(new_torneo)

def get_torneos():
  all_torneos = Torneos.query.all()
  result = torneos_schema.dump(all_torneos)
  return jsonify(result)

def get_torneo(id_torneo):
  torneo = Torneos.query.get(id_torneo)
  return torneo_schema.jsonify(torneo)

def update_torneo(id):
  torneo = Torneos.query.get(id)

  nombre_torneo = request.json['nombre_torneo']
  torneo.nombre_equipo = nombre_torneo
  db_session.commit()
  return jsonify(torneo_schema.dumps(torneo))

def delete_torneo(id_torneo):
  torneo = Torneos.query.get(id_torneo)
  db_session.delete(torneo)
  db_session.commit()

  return jsonify(torneo_schema.dumps(torneo))

#FUNCIONES PARA PARTIDAS

def add_partida():
  id_partida = request.json['id_partida']
  resultado_partida = request.json['resultado_partida']

  new_partida = Partidas(id_partida, resultado_partida)

  db_session.add(new_partida)
  db_session.commit()

  return partida_schema.jsonify(new_partida)

def get_partidas():
  all_partidas = Partidas.query.all()
  result = partidas_schema.dump(all_partidas)
  return jsonify(result)

def get_partida(id_partida):
  partida = Partidas.query.get(id_partida)
  return partida_schema.jsonify(partida)

def update_partida(id):
  partida = Partidas.query.get(id)

  resultado_partida = request.json['resultado_partida']
  partida.resultado_partida = resultado_partida
  db_session.commit()
  return jsonify(partida_schema.dumps(partida))

def delete_partida(id_partida):
  partida = Partidas.query.get(id_partida)
  db_session.delete(partida)
  db_session.commit()

  return jsonify(partida_schema.dumps(partida))

#FUNCIONES EQUI_JUGA

def add_equi_juga():
  id_equipo = request.json['id_equipo']
  id_jugador = request.json['id_jugador']

  new_equi_juga = Equi_juga(id_equipo, id_jugador)

  db_session.add(new_equi_juga)
  db_session.commit()
  return jsonify(equi_juga_schema.dump(new_equi_juga))

def get_equis_jugas():
   all_equi_juga = Equi_juga.query.all()
   result = equi_jugas_schema.dump(all_equi_juga)
   return jsonify(result)

def get_equi_jugas(id_equipo):
  equi_jugas = Equi_juga.query.get(id_equipo)
  return jsonify(equi_jugas_schema.dumps(equi_jugas))

def delete_equi_juga(id_equipo, id_jugador):
  equi_juga = Equi_juga.query.get((id_equipo, id_jugador))
  db_session.delete(equi_juga)
  db_session.commit()

  return jsonify(equi_juga_schema.dumps(equi_juga))

#FUNCIONES PARA EQUI_TORNEO

def add_equi_torneo():
  id_equipo = request.json['id_equipo']
  id_torneo = request.json['id_torneo']

  new_equi_torneo = Equi_torneo(id_equipo, id_torneo)

  db_session.add(new_equi_torneo)
  db_session.commit()
  return jsonify(equi_torne_schema.dump(new_equi_torneo))

def get_equis_torneos():
   all_equis_tornes = Equi_torneo.query.all()
   result = equi_torneos_schema.dump(all_equis_tornes)
   return jsonify(result)

def get_equis_torneo(id_torneo):
  equi_torne = Equi_torneo.query.get(id_torneo)
  return jsonify (equi_torneos_schema.dumps(equi_torne))

def delete_equi_torneo(id_equipo, id_torneo):
  equi_torneo = Equi_torneo.query.get((id_equipo, id_torneo))
  db_session.delete(equi_torneo)
  db_session.commit()

  return jsonify(equi_torneo_schema.dumps(equi_torneo))

#FUNCIONES PARA EQUI_TORNEO_PARTIDA
def delete_equi_torneo_partida(id_equipo, id_torneo, id_partida):
  equi_torneo_partida = Equi_torneo_partida.query.get((id_equipo, id_torneo, id_partida))
  db_session.delete(equi_torneo_partida)
  db_session.commit()

  return jsonify(equi_torneo_partida_schema.dumps(equi_torneo_partida))

#Inicio
def index():
    return render_template('index.html')