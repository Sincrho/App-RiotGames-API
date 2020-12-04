from flask import render_template, url_for, request, jsonify
from api.model.database import db_session
from api.model.tables import *
from api.schema.schemas import *
import requests
import json
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


equi_torneo_partida_schema = Equi_torneo_partidaSchema ()
equi_torneo_partidas_schema = Equi_torneo_partidaSchema (many=True)

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
  return jsonify(jugador_schema.dump(jugador))

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

  db_session.add(new_equipo)
  db_session.commit()
  return jsonify(equipo_schema.dumps(new_equipo))

def get_equipos():
  all_equipos = Equipos.query.all()
  result = equipos_schema.dump(all_equipos)
  return jsonify(result)

def get_equipo(id_equipo):
  equipo = Equipos.query.get(id_equipo)
  return jsonify(equipo_schema.dump(equipo))

def update_equipo(id_equipo):
  equipo = Equipos.query.get(id_equipo)
  nombre_equipo = request.json['nombre_equipo']
  equipo.nombre_equipo = nombre_equipo
  db_session.commit()
  return jsonify(equipo_schema.dump(equipo))

def delete_equipo(id_equipo):
  equipo = Equipos.query.get(id_equipo)
  db_session.delete(equipo)
  db_session.commit()

  return jsonify(equipo_schema.dump(equipo))

#FUNCIONES PARA SERVIDORES

def add_servidor():
  id_servidor = request.json['id_servidor']
  region_servidor = request.json['region_servidor']

  new_servidor = Servidores(id_servidor, region_servidor)

  db_session.add(new_servidor)
  db_session.commit()

  return jsonify(servidor_schema.dump(new_servidor))

def get_servidores():
  all_servidores = Servidores.query.all()
  result = servidores_schema.dump(all_servidores)
  return jsonify(result)

def get_servidor(id_servidor):
  servidor = Servidores.query.get(id_servidor)
  return jsonify(servidor_schema.dump(servidor))

#FUNCIONES PARA TORNEO
def add_torneo():
  id_torneo = request.json['id_torneo']
  nombre_torneo = request.json['nombre_torneo']

  new_torneo = Torneos(id_torneo, nombre_torneo)

  db_session.add(new_torneo)
  db_session.commit()

  return jsonify(torneo_schema.dump(new_torneo))

def get_torneos():
  all_torneos = Torneos.query.all()
  result = torneos_schema.dump(all_torneos)
  return jsonify(result)

def get_torneo(id_torneo):
  torneo = Torneos.query.get(id_torneo)
  return jsonify(torneo_schema.dump(torneo))

def update_torneo(id_torneo):
  torneo = Torneos.query.get(id_torneo)
  nombre_torneo = request.json['nombre_torneo']
  torneo.nombre_torneo = nombre_torneo
  db_session.commit()
  return jsonify(torneo_schema.dump(torneo))

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

  return jsonify(partida_schema.dumps(new_partida))

def get_partidas():
  """ devuelve las partidas 
  ---
   parameters:
     - name: parametro
   responses:
      200:
          description: trajo todas las partidas
          examples:
            result: [1,2,3]          
  """
  all_partidas = Partidas.query.all()
  result = partidas_schema.dump(all_partidas)
  return jsonify(result)

def get_partida(id_partida):
  partida = Partidas.query.get(id_partida)
  return jsonify(partida_schema.dump(partida))

def update_partida(id_partida):
  partida = Partidas.query.get(id_partida)
  resultado_partida = request.json['resultado_partida']
  partida.resultado_partida = resultado_partida
  db_session.commit()
  return jsonify(partida_schema.dump(partida))

def delete_partida(id_partida):
  partida = Partidas.query.get(id_partida)
  db_session.delete(partida)
  db_session.commit()

  return jsonify(partida_schema.dump(partida))

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

def delete_equi_juga(id_equipo, id_jugador):
  equi_juga = Equi_juga.query.get((id_equipo, id_jugador))
  db_session.delete(equi_juga)
  db_session.commit()

  return jsonify(equi_juga_schema.dump(equi_juga))

def get_equi_jugas(id_equipo):
  equi_jugas = Equi_juga.query.filter(Equi_juga.id_equipo==id_equipo)
  return jsonify(equi_jugas_schema.dump(equi_jugas))

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
  equis_torneo = Equi_torneo.query.filter(Equi_torneo.id_torneo==id_torneo)
  return jsonify(equi_torneos_schema.dump(equis_torneo))

def delete_equi_torneo(id_equipo, id_torneo):
  equi_torneo = Equi_torneo.query.get((id_equipo, id_torneo))
  db_session.delete(equi_torneo)
  db_session.commit()

  return jsonify(equi_torneo_schema.dump(equi_torneo))

#FUNCIONES PARA EQUI_TORNEO_PARTIDA
def delete_equi_torneo_partida(id_equipo, id_torneo, id_partida):
  equi_torneo_partida = Equi_torneo_partida.query.get((id_equipo, id_torneo, id_partida))
  db_session.delete(equi_torneo_partida)
  db_session.commit()

  return jsonify(equi_torneo_partida_schema.dump(equi_torneo_partida))

def get_equis_torneo_partidas(id_torneo):
  equis_torneo_partidas = Equi_torneo_partida.query.filter(Equi_torneo_partida.id_torneo==id_torneo)
  return jsonify(equi_torneo_partidas_schema.dump(equis_torneo_partidas))

def get_equis_torneos_partidas():
   all_equis_torneos_partidas = Equi_torneo_partida.query.all()
   result = equi_torneo_partidas_schema.dump(all_equis_torneos_partidas)
   return jsonify(result)


def add_equi_torneo_partida():
  id_equipo = request.json['id_equipo']
  id_torneo = request.json['id_torneo']
  id_partida = request.json['id_partida']
  new_equi_torneo_partida = Equi_torneo_partida(id_equipo, id_torneo, id_partida)
  db_session.add(new_equi_torneo_partida)
  db_session.commit()
  return jsonify(equi_torneo_partida_schema.dump(new_equi_torneo_partida))

#FUNCIONES PARA PEGARLE A RITO

def get_perfil(id_servidor,nombre_jugador):
  apiKey=""
  request_summoner  = requests.get("https://"+id_servidor+".api.riotgames.com/lol/summoner/v4/summoners/by-name/"+nombre_jugador+"?api_key="+apiKey)
  summoner=json.loads(request_summoner.text)
  summoner_id=summoner["id"]
  request_league= requests.get("https://"+id_servidor+".api.riotgames.com/lol/league/v4/entries/by-summoner/"+summoner_id+"?api_key="+apiKey)
  json_perfil = jsonify(request_league.text)
  return json_perfil





#Inicio
def index():
    return render_template('index.html')