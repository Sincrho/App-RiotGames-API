from marshmallow import Schema,fields

#Esquema de Jugador
class JugadorSchema(Schema):
  class Meta:
    fields = ('id_jugador', 'id_servidor', 'nombre_jugador')

#Esquema de Equipo
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