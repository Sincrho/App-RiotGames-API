<script >
    let input = "";
    import { onMount } from "svelte";
    const apiURLGetPartidas = "http://127.0.0.1:5000/get_partidas";
    let dataPartidas = [];  // estructura que va a almacenar el json de la respuesta de la api
    //onMount ejecuta la funcion al principio 
    onMount(async function() {
          const response = await fetch(apiURLGetPartidas);
          dataPartidas = await response.json();
          //console.log(dataPartidas)
      });
      let sortBy = {col: "id_partida", ascending: true};
      
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
      
      dataPartidas = dataPartidas.sort(sort);
    }


</script>
  
       
<!--<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</svelte:head>-->
  
<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)">
    <div class="container" style="padding-top:7%">  
      <table class="highlight centered">
        <thead class="blue darken-1 white-text">
          <tr>
            <th on:click={sort("id_partida")}>Partida</th>
            <th on:click={sort("resultado_partida")}>Resultado</th>
            <th></th>
          </tr>
        </thead>
        <tbody class ="blue-grey lighten-4">
          {#each dataPartidas as row}
            <tr>
              <td>{row.id_partida}</td>
              <td>{row.resultado_partida}</td>
              <td><a href="/#/EditarPartida/{row.id_partida}"><i class="material-icons left blue-text">edit</i></a></td>
            </tr>
          {/each}
        </tbody>
        <a href="/#/NuevaPartida" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>
      </table>
    </div>  
</body>        

  
































