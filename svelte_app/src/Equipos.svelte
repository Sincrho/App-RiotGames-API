<script >
    import { onMount } from "svelte";
    const apiURLGetEquipos = "http://127.0.0.1:5000/get_equipos";
    let dataEquipos = [];
  
    onMount(async function() {
          const response = await fetch(apiURLGetEquipos);
          dataEquipos = await response.json();
          //console.log(dataEquipos)
    });
    let sortBy = {col: "id_equipo", ascending: true};
    
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
      dataEquipos = dataEquipos.sort(sort);
    }
</script>
  
       
<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)">
  <div class="container" style="padding-top:7%">  
    <table class="highlight centered">

      <thead class="blue darken-1 white-text">
        <tr>
          <th on:click={sort("nombre_equipo")}>Equipos</th>
          <th></th>
        </tr>
      </thead>

        <tbody style = "background: rgba(0,0,0,0.5);">
          {#each dataEquipos as row}
            <tr>
              <td><a href="/#/PerfilEquipo/{row.id_equipo}">{row.nombre_equipo}</a></td>
              <td><a href="/#/EditarEquipo/{row.id_equipo}"><i class="material-icons left blue-text">edit</i></a></td>
            
            </tr>
          {/each}
        </tbody>
        
    </table>
    <a href="/#/NuevoEquipo" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>
  </div>  
    
</body>        

  