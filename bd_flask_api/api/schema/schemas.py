from marshmallow import Schema,fields

class JugadorSchema(Schema): #Los jugadores tienen un estructura que son estos 3 campos.
  class Meta:
    fields = ('id_jugador', 'id_servidor', 'nombre_jugador') 

class EquipoSchema(Schema):
  class Meta:
    fields = ('id_equipo', 'nombre_equipo')

class ServidorSchema(Schema):
  class Meta:
    fields = ('id_servidor', 'region_servidor')

class TorneoSchema(Schema):
  class Meta:
    fields = ('id_torneo', 'nombre_torneo')

class PartidaSchema(Schema):
  class Meta:
    fields = ('id_partida', 'resultado_partida')

class Equi_jugaSchema(Schema):
  class Meta:
    fields = ('id_equipo', 'id_jugador')

class Equi_torneoSchema(Schema):
  class Meta:
    fields = ('id_equipo', 'id_torneo')

class Equi_torneo_partidaSchema(Schema):
  class Meta:
    fields = ('id_equipo', 'id_torneo', 'id_partida')

