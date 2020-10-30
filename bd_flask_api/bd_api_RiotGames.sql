CREATE TABLE Servidores (
id_servidor VARCHAR(10) PRIMARY KEY,
region_servidor VARCHAR(40)
);

CREATE TABLE Jugadores (
id_jugador INTEGER IDENTITY(1,1) PRIMARY KEY,
id_servidor VARCHAR(10) references Servidores,
nombre_jugador VARCHAR(50)
);

CREATE TABLE Equipos (
id_equipo INTEGER IDENTITY(1,1) PRIMARY KEY,
nombre_equipo VARCHAR(50));

CREATE TABLE equi_juga (
id_equipo INTEGER references Equipos,
id_jugador INTEGER references Jugadores,
PRIMARY KEY (id_equipo, id_jugador)
);

CREATE TABLE Torneos (
id_torneo INTEGER IDENTITY(1,1) PRIMARY KEY ,
nombre_torneo VARCHAR(100));

CREATE TABLE equi_torneo (
id_equipo INTEGER references Equipos,
id_torneo INTEGER references Torneos,
PRIMARY KEY (id_equipo,id_torneo));


CREATE TABLE Partidas (
id_partida INTEGER IDENTITY(1,1) PRIMARY KEY,
resultado_partida VARCHAR(50));

CREATE TABLE equi_torneo_partida (
id_equipo INTEGER references Equipos,
id_torneo INTEGER references Torneos,
id_partida INTEGER references Partidas,
PRIMARY KEY (id_torneo, id_equipo, id_partida));


INSERT into Servidores values('BR1','Brasil')
INSERT into Servidores values('EUN1','Europa Norte')
INSERT into Servidores values('EUW1','Europa Oeste')
INSERT into Servidores values('JP1','Japon')
INSERT into Servidores values('KR','Korea')
INSERT into Servidores values('LA1','Latinoamerica Norte')
INSERT into Servidores values('LA2','Latinoamerica Sur')
INSERT into Servidores values('NA','Norteamerica')
INSERT into Servidores values('OC1','Oceania')
INSERT into Servidores values('RU','Rusia')
INSERT into Servidores values('TR1','Turquia')
go
INSERT into Jugadores values('LA2','Sincrho')
INSERT into Jugadores values('LA2','BNarco')
INSERT into Jugadores values('LA2','SHINZO')
INSERT into Jugadores values('LA2','tadomirimo73')
INSERT into Jugadores values('LA2','Kyudenre')
INSERT into Jugadores values('LA2','maximusguti')
INSERT into Jugadores values('LA2','XioX')
INSERT into Jugadores values('LA2','BrancaPower')
INSERT into Jugadores values('LA2','Mc Rinji')
INSERT into Jugadores values('LA2','imugisenpai')
INSERT into Jugadores values('LA2','POL4R1')
INSERT into Jugadores values('LA2','NYANa10')
INSERT into Jugadores values('LA2','14 ms')
go
INSERT into Equipos values('Comadreja Team')
INSERT into Equipos values('Carpincho Team')
INSERT into Equipos values('Caniche Team')
go
INSERT into equi_juga values(1,1)
INSERT into equi_juga values(1,2)
INSERT into equi_juga values(1,3)
INSERT into equi_juga values(1,4)
INSERT into equi_juga values(1,5)
INSERT into equi_juga values(2,6)
INSERT into equi_juga values(2,7)
INSERT into equi_juga values(2,8)
INSERT into equi_juga values(2,9)
INSERT into equi_juga values(2,10)
go
INSERT into Torneos values('Copa Pascal')
INSERT into Torneos values('Copa Carpincho - Patrocinada por MONSTER')
go
INSERT into equi_torneo values(1,1)
INSERT into equi_torneo values(2,1)
go
INSERT into Partidas values('Gano Carpincho Team')
go
INSERT into equi_torneo_partida values(1,1,1)
INSERT into equi_torneo_partida values(2,1,1)
go

SELECT * from Servidores
SELECT * from Jugadores j,Servidores s where j.id_servidor = s.id_servidor  
DROP table Servidores
DROP table Jugadores
DROP table Equipos
DROP table Partidas
DROP table equi_juga
DROP table equi_torneo
DROP table equi_torneo_partida
DROP table Torneos


