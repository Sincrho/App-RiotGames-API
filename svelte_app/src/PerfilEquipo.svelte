<script>
  import { onMount } from "svelte";
  export let params

  let idEquipo = params.ID_Equipo // para la url de la api

  const apiURLGetEquiJugadores = "http://127.0.0.1:5000/get_equi_jugas/";
  const apiURLGetJugador = "http://127.0.0.1:5000/get_jugador/";
  const apiURLDelJugadorEquipo = "http://127.0.0.1:5000/delete_equi_juga/";
  let dataJugadores = [];

  onMount(async function() {
    let dataJugadoresAux =[];    
    const response = await fetch(apiURLGetEquiJugadores+idEquipo);
    let dataJugadoresEquipo  = await response.json();
  

    for(let i = 0; i < dataJugadoresEquipo.length; i++) {
      const response = await fetch(apiURLGetJugador+dataJugadoresEquipo[i].id_jugador);
      let dataJugador  = await response.json();
      dataJugadoresAux.push(dataJugador);
    } 
    dataJugadores = dataJugadoresAux; // svelte no reacciona push.....
   
  });

  async function BorrarJugadorEquipo(p_id_jugador){ // elimina la relacion equipo torneo partida
      const response= await fetch(apiURLDelJugadorEquipo+idEquipo+"/"+p_id_jugador,{
              method: 'DELETE'
          });
      
      const json = await response.json()
      let result = JSON.stringify(json)
      console.log(result)
      location.reload();
    }  
</script>


  <body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)">
    <div class="container" style="padding-top:7%">  
      <table class="highlight centered ">
        <thead class="blue darken-1 white-text">
          <tr>
            <th >Servidor</th>
            <th >Jugador</th>
            <th></th>
          </tr>
        </thead>
        <tbody style = "background: rgba(0,0,0,0.5);">
          {#each dataJugadores as row}
            <tr>
              <td class="blue-text">{row.id_servidor}</td>
              <td><a href="/#/PerfilJugador/{row.id_servidor}*{row.nombre_jugador}">{row.nombre_jugador}</a></td>
              <td><a style="cursor:pointer;"on:click={()=> BorrarJugadorEquipo(row.id_jugador)}><i class="material-icons left blue-text ">delete</i></a></td>
              <!--<td><a href="/#/EditarJugador/{row.id_jugador}"><i class="material-icons left blue-text">delete</i></a></td>-->
            </tr>
          {/each}
        </tbody>
      </table>
      <a href="/#/NuevoJugadorEquipo/{idEquipo}" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>
 
    </div>  

        
  </body>
                









