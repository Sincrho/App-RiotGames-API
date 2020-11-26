<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
	import Router, {location, link} from 'svelte-spa-router';
	import Jugadores from './Jugadores.svelte';
  import EditarJugador from './EditarJugador.svelte';
  
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
  <div class="nav-wrapper #283593 indigo darken-3">
    <a href="#!" class="brand-logo"><i class="material-icons">cloud</i>App Rito</a>
    <ul class="right hide-on-med-and-down">
      <li><a href="sass.html"><i class="material-icons">search</i></a></li>
      <li><a href="/#/Jugadores">JUGA<i class="material-icons">view_module</i></a></li>
      <li><a href="/#/EditarJugador/:ID_Jugador">EJUGA<i class="material-icons">refresh</i></a></li>
    </ul>
  </div>
</nav>

<Router routes={{
	'/': Jugadores,
	'/EditarJugador/:ID_Jugador': EditarJugador,
	'/Jugadores': Jugadores
}} />



