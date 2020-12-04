<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
	import Router, {location, link} from 'svelte-spa-router';
  import Jugadores from './Jugadores.svelte';
  import Torneos from './Torneos.svelte';
  import Partidas from './Partidas.svelte';
  import Equipos from './Equipos.svelte';

  import EditarJugador from './EditarJugador.svelte';
  import EditarTorneo from './EditarTorneo.svelte';
  import EditarPartida from './EditarPartida.svelte';
  import EditarEquipo from './EditarEquipo.svelte';

  import NuevoJugador from './NuevoJugador.svelte';
  import NuevoEquipo from './NuevoEquipo.svelte';
  import NuevoTorneo from './NuevoTorneo.svelte';
  import NuevaPartida from './NuevaPartida.svelte';

  import PerfilJugador from './PerfilJugador.svelte';
  import PerfilEquipo from  './PerfilEquipo.svelte';
  import PerfilTorneo from  './PerfilTorneo.svelte';
</script>


<svelte:head>
  <!--Import Google Icon Font-->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <!--Import materialize.css-->
  <link type="text/css" rel="stylesheet" href="css/materialize.min.css"  media="screen,projection"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <!--Let browser know website is optimized for mobile-->
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</svelte:head>




<nav>
  <div class="nav-wrapper  blue darken-1">
    <a href="#!" class="brand-logo large"><i class="material-icons">videogame_asset</i>Tournament Manager</a>
    <ul class="right hide-on-med-and-down">
      <li><a href="/#/Jugadores" style="color:white">Jugadores <i class="material-icons right white-text">person_outline</i></a></li>
      <li><a href="/#/Torneos" style="color:white">Torneos <i class="material-icons right white-text">emoji_events</i></a></li>
      <li><a href="/#/Equipos" style="color:white">Equipos <i class="material-icons right white-text">groups</i></a></li>
      <li><a href="/#/Partidas" style="color:white">Partidas <i class="material-icons right white-text">sports_mma</i></a></li>
    </ul>
  </div>
</nav>

<Router routes={{
	'/': Jugadores,
	'/EditarJugador/:ID_Jugador': EditarJugador,
  '/Jugadores': Jugadores,
  '/NuevoJugador': NuevoJugador,

  '/EditarTorneo/:ID_Torneo': EditarTorneo,
  '/EditarPartida/:ID_Partida': EditarPartida,
  '/EditarEquipo/:ID_Equipo': EditarEquipo,
 
  '/Torneos': Torneos,
  '/Partidas': Partidas,
  '/Equipos': Equipos,


  '/NuevoEquipo':NuevoEquipo,
  '/NuevoTorneo':NuevoTorneo,
  '/NuevaPartida': NuevaPartida,
  '/PerfilJugador/:ID_Servidor': PerfilJugador,
  '/PerfilEquipo/:ID_Equipo': PerfilEquipo,
  '/PerfilTorneo/:ID_torneo': PerfilTorneo

   

}} />



