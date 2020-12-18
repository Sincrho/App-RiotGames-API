<script>
  
  import { onMount } from "svelte";
  const apiURLGetJugadores = "http://127.0.0.1:5000/get_jugadores";
  let dataJugadores = []; // estructura que va a almacenar el json de la respuesta de la api
  //onMount ejecuta la funcion al principio 
  onMount(async function() {
        const response = await fetch(apiURLGetJugadores);
        dataJugadores = await response.json();
        console.log(dataJugadores)
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
    
      dataJugadores = dataJugadores.sort(sort);
	}

</script>


     
            
<!--<svelte:head>

  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</svelte:head>-->

<main>
  <body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)">
      <div class="container" style="padding-top:7%">  
        <table class="highlight centered ">
          <thead class="blue darken-1 white-text">
            <tr>
              <th on:click={sort("id_servidor")}>Servidor</th>     <!--on:click lleva a la funcion de js declarada arriba-->
              <th on:click={sort("nombre_jugador")}>Jugador</th>
              <th></th>
            </tr>
          </thead>
          <tbody style = "background: rgba(0,0,0,0.5);">
            {#each dataJugadores as row}
              <tr>
                <td class="blue-text">{row.id_servidor}</td>
                <td><a href="/#/PerfilJugador/{row.id_servidor}*{row.nombre_jugador}">{row.nombre_jugador}</a></td>  <!--concatenamos la url como PerfilJugador/5*BNarco... problemas-->
                <td><a href="/#/EditarJugador/{row.id_jugador}"><i class="material-icons left blue-text">edit</i></a></td>
              </tr>
            {/each}
          </tbody>
        </table>       
        <a href="/#/NuevoJugador" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>
      </div>
  </body>    
</main>






