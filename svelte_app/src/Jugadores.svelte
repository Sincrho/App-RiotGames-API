<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">

  import Router, {location, link} from 'svelte-spa-router';
  import editarJugador from './EditarJugador.svelte';

  let input = "";
  import { onMount } from "svelte";
  const apiURL = "http://127.0.0.1:5000/get_jugadores";
  let data = [];

  onMount(async function() {
        const response = await fetch(apiURL);
        data = await response.json();
    });
    let sortBy = {col: "id_jugador", ascending: true};
    
    $: sort = (column) => {
		
		if (sortBy.col == column) {
			sortBy.ascending = !sortBy.ascending
		} else {
			sortBy.col = column
			sortBy.ascending = true
		}
		
		// Modifier to sorting function for ascending or descending
		let sortModifier = (sortBy.ascending) ? 1 : -1;
		let sort = (a, b) => 
			(a[column] < b[column]) 
			? -1 * sortModifier 
			: (a[column] > b[column]) 
			? 1 * sortModifier 
			: 0;
		
		data = data.sort(sort);
	}

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


<main>
  <body>
      <table class="highlight">
        <thead class="#7986cb indigo lighten-2">
          <tr>
            <th on:click={sort("id_jugador")}>id_jugador</th>
            <th on:click={sort("id_servidor")}>id_servidor</th>
            <th on:click={sort("nombre_jugador")}>nombre_jugador</th>
            <th></th>
          </tr>
        </thead>
        <tbody class ="#c5cae9 indigo lighten-4">
          {#each data as row}
            <tr>
              <td>{row.id_jugador}</td>
              <td>{row.id_servidor}</td>
              <td>{row.nombre_jugador}</td>
              <td><a href="/#/EditarJugador/{row.id_jugador}"><i class="material-icons left">edit</i></a></td>
            </tr>
          {/each}
        </tbody>
        <button class="btn waves-effect waves-light" type="submit" name="action" onclick="location.href='nuevapersona.php'" ><i class="material-icons right">AGREGAR PERSONA</i> </button>    
      </table>
  </body>        
</main>




