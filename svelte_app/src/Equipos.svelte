<script >
    let input = "";
    import { onMount } from "svelte";
    const apiURL = "http://127.0.0.1:5000/get_equipos";
    let data = [];
  
    onMount(async function() {
          const response = await fetch(apiURL);
          data = await response.json();
          console.log(data)
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
          
          data = data.sort(sort);
      }
  
    document.addEventListener('DOMContentLoaded', function() {
      var elems = document.querySelectorAll('.modal');
      var instances = M.Modal.init(elems, options);
    });
  </script>
  
       
              
  <svelte:head>
    <!--Import Google Icon Font-->
    <!--Import materialize.css-->        
    <!--Let browser know website is optimized for mobile-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </svelte:head>
  
  

    <body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)">
        <div class="container" style="padding-top:7%">  
          <table class="highlight centered">
            <thead class="blue darken-1 white-text">
              <tr>
                <th on:click={sort("nombre_equipo")}>Equipos</th>
                <th></th>
              </tr>
            </thead>
            <tbody class ="blue-grey lighten-4">
              {#each data as row}
                <tr>
                  <td>{row.nombre_equipo}</td>
                  <td><a href="/#/EditarEquipo/{row.id_equipo}"><i class="material-icons left blue-text">edit</i></a></td>
                </tr>
              {/each}
            </tbody>
           

            
          </table>
          <a href="/#/NuevoEquipo" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>

        </div>  
        
    </body>        
 
  