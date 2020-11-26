from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from api.model.database import Base

class Jugadores(Base):
    __tablename__ = 'Jugadores'
    id_jugador = Column(Integer, primary_key=True)
    id_servidor = Column(String(10), nullable=False, ForeignKey('Servidores.id_servidor'))
    nombre_jugador = Column(String(50))

    def __init__(self, id_jugador, id_servidor, nombre_jugador):
        self.id_jugador = id_jugador
        self.id_servidor = id_servidor
        self.nombre_jugador = nombre_jugador
    def __repr__(self):
        #return '<User %r>' % (self.name)
        pass

class Equipos(Base):
    __tablename__ = 'Equipos'
    id_equipo = Column( Integer, primary_key=True)
    nombre_equipo = Column( String(50))

    def __init__(self, id_equipo, nombre_equipo):
        self.id_equipo = id_equipo
        self.nombre_equipo = nombre_equipo
    def __repr__(self):
        #return '<User %r>' % (self.name)
        pass

class Servidores(Base):
    __tablename__ = 'Servidores'
    id_servidor =  Column( Integer, primary_key=True)
    region_servidor =  Column( String(40))

    def __init__(self, id_servidor, region_servidor):
        self.id_servidor = id_servidor
        self.region_servidor = region_servidor
    def __repr__(self):
        #return '<User %r>' % (self.name)
        pass

class Partidas(Base):
    __tablename__ = 'Partidas'
    id_partida =  Column( Integer, primary_key=True)
    resultado_partida =  Column( String(50), nullable=False)

    def __init__(self, id_partida, resultado_partida):
        self.id_partida = id_partida
        self.resultado_partida = resultado_partida
    def __repr__(self):
        #return '<User %r>' % (self.name)
        pass

class Torneos(Base):
    __tablename__ = 'Torneos'
    id_torneo = Column( Integer, primary_key=True)
    nombre_torneo =  Column( String(100), nullable=False)

    def __init__(self, id_torneo, nombre_torneo):
        self.id_torneo = id_torneo
        self.nombre_torneo = nombre_torneo
    def __repr__(self):
        #return '<User %r>' % (self.name)
        pass

class Equi_juga(Base):
    __tablename__ = 'equi_juga'
    id_equipo = Column( Integer, primary_key=True, ForeignKey('Equipos.id_equipo'))
    id_jugador = Column( Integer, primary_key=True, ForeignKey('Jugadores.id_jugador'))

    def __init__(self, id_equipo, id_jugador):
        self.id_equipo = id_equipo
        self.id_jugador = id_jugador
    def __repr__(self):
        #return '<User %r>' % (self.name)
        pass

class Equi_torneo(Base):
    __tablename__ = 'equi_torneo'
    id_equipo = Column( Integer, primary_key=True, ForeignKey('Equipos.id_equipo'))
    id_torneo = Column( Integer, primary_key=True, ForeignKey('Torneos.id_torneo'))

    def __init__(self, id_equipo, id_torneo):
        self.id_equipo = id_equipo
        self.id_torneo = id_torneo
    def __repr__(self):
        #return '<User %r>' % (self.name)
        pass

class Equi_torneo_partida(Base):
    __tablename__ = 'equi_torneo_partida'
    id_equipo =  Column( Integer, primary_key=True, ForeignKey('equi_torneo.id_equipo'))
    id_torneo =  Column( Integer, primary_key=True, ForeignKey('equi_torneo.id_torneo'))
    id_partida =  Column( Integer, primary_key=True, ForeignKey('Partidas.id_partida'))

    def __init__(self, id_equipo, id_torneo, id_partida):
        self.id_equipo = id_equipo
        self.id_torneo = id_torneo
        self.id_partida = id_partida
    def __repr__(self):
        #return '<User %r>' % (self.name)
        pass