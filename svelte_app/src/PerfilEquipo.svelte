<script>
  import { onMount } from "svelte";
import { loop_guard } from "svelte/internal";
  export let params
  let idEquipo = params.ID_Equipo
  const apiURL = "http://127.0.0.1:5000/get_equi_jugas/";
  const apiURL2 = "http://127.0.0.1:5000/get_jugador/";
  let dataJugadores = [];
  let dataJugadoresEquipo = [];
  let dataJugadoresAux =[];
    onMount(async function() {

        const response = await fetch(apiURL+idEquipo);
        let json  = await response.json();
        dataJugadoresEquipo = json;
   
        for(let i = 0; i < dataJugadoresEquipo.length; i++) {
          const response = await fetch(apiURL2+dataJugadoresEquipo[i].id_jugador);
          let json2  = await response.json();
          dataJugadoresAux.push(json2);
        } 
        dataJugadores = dataJugadoresAux; // svelte no reacciona push.....
     
    });  
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
        <!-- <tbody class ="blue-grey lighten-4">-->   
        <tbody style = "background: rgba(0,0,0,0.5);">
          {#each dataJugadores as row}
            <tr>
              <td class="blue-text">{row.id_servidor}</td>
            <td><a href="/#/PerfilJugador/{row.id_servidor}*{row.nombre_jugador}">{row.nombre_jugador}</a></td>
              <td><a href="/#/EditarJugador/{row.id_jugador}"><i class="material-icons left blue-text">edit</i></a></td>
            </tr>
          {/each}
        </tbody>
      </table>
      <a href="/#/NuevoJugador" class="btn-floating btn-large waves-effect waves- blue darken-1"><i class="material-icons left">add</i></a>

    </div>

        
  </body>
                









